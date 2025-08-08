"use server";

import {
  arivalSchema,
  arrivalItemSchema,
  ArrivalItemSchema,
} from "../formValidationSchemas";
import prisma from "../prisma";
import { getAuthenticatedUserInfo } from "./authActions";

import flatToObject from "../flatToObjext";
import { google } from "googleapis";
import { Readable } from "stream";
type CurrentState = { success: boolean; error: boolean };
type FormState = {
  success: boolean;
  message: string | null;
  errors?: any;
};
import { ArrivalStatus } from "@/app/utils/enum";

export const createArrival = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    const result: any = flatToObject(formData);
    console.log('Received form data:', result);
    const materialData: Record<number, Partial<ArrivalItemSchema>> = {};
    const materialsString = formData.get("materials") as string | null;
    const materials = materialsString ? JSON.parse(materialsString) : [];
    const securityProofFiles = formData.getAll("securityProof") as File[];
    const securityProofForZod = securityProofFiles.map((file) => ({ file: file }));
    for (const [key, value] of formData.entries()) {
      const match = key.match(/^materials\[(\d+)\]\.(.+)$/); // Match "materials[0].id", "materials[0].name", etc.
      if (match && typeof value === "string") {
        const index = parseInt(match[1], 10);
        const property = match[2] as keyof ArrivalItemSchema;
        if (!materialData[index]) {
          materialData[index] = {};
        }
        materialData[index][property] = value as any;
      }
    }
    const submittedItem = Object.keys(materials)
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      .map((key) => materials[parseInt(key, 10)])
      // Ensure essential parts exist before validation (adjust if needed)
      .filter((sch) => sch.materialId !== undefined) as Partial<ArrivalItemSchema>[];
    if (submittedItem.length === 0) {
      return {
        success: false,
        message: "Please define at least one material.",
      };
    }
    const validationErrors: string[] = [];
    const validatedBreaks: ArrivalItemSchema[] = [];
    submittedItem.forEach((br, index) => {
      const result = arrivalItemSchema.safeParse(br);
      if (!result.success) {
        // Combine multiple errors for one item if needed
        validationErrors.push(
          `materials ${index + 1}: ${result.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`
        );
      } else {
        validatedBreaks.push(result.data); // Collect successfully validated schedules
      }
    });
    if (validationErrors.length > 0) {
      console.log("Server Validation Failed:", validationErrors);
      return {
        success: false,
        message: "Validation failed. Please check the schedule details.",
        errors: { schedules: validationErrors }, // Assign errors
      };
    }
    console.log("securityProof is an instance of File:", formData.getAll("securityProof") instanceof File);
    console.log('validatedFields', formData)
    const validatedFields = arivalSchema.safeParse({
      id: formData.get("arrivalId"),
      supplierId: formData.get("supplierId"),
      arrivalDate: formData.get("arrivalDate"),
      arrivalTime: formData.get("arrivalTime"),
      nopol: formData.get("nopol"),
      suratJalan: formData.get("suratJalan"),
      securityProof: securityProofForZod,
      materials: materials,
    });
    console.log("Validated Fields:", validatedFields.error);
    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    const { userId } = await getAuthenticatedUserInfo();
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!serviceAccountJson) {
      console.error("Google Service Account JSON not found in environment variables.");
      return { success: false, message: "Server configuration error." };
    }
    if (!folderId) {
      console.error("Google Drive Folder ID not found in environment variables.");
      return { success: false, message: "Server configuration error (folder)." };
    }
    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (error) {
      console.error("Failed to parse Google Service Account JSON:", error);
      return {
        success: false,
        message: "Server configuration error (JSON parse).",
      };
    }
    const uploadedFileIds: string[] = [];
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined, 
      credentials.private_key,
      ["https://www.googleapis.com/auth/drive.file"]
    );
    const drive = google.drive({ version: "v3", auth });
    if (securityProofFiles.length === 0) {
      console.error(`File not found for index`);
    }
    for (const proof of validatedFields.data.securityProof) {
      const file = proof.file;

      const fileMetadata = {
        name: file.name,
        parents: [folderId],
      };
      const media = {
        mimeType: file.type,
        body: Readable.fromWeb(file.stream() as any),
      };
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, name",
      });

      if (!response.data.id) {
        throw new Error("File ID is missing from Google Drive upload response.");
      }

      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
      uploadedFileIds.push(response.data.id);
    }
    console.log("Uploaded File IDs:", uploadedFileIds);
    await prisma.$transaction(async (tx) => {
      const arrival = await tx.arrivals.create({
        data: {
          idKedatangan: validatedFields.data.id ?? "",
          supplierId: validatedFields.data.supplierId,
          arrivalTime: validatedFields.data.arrivalTime,
          nopol: validatedFields.data.nopol,
          suratJalan: validatedFields.data.suratJalan,
          createdBy: userId,
          updatedBy: userId,
        },
      });
      

      if (uploadedFileIds.length > 0) {
        await tx.securityPhotos.createMany({
          data: uploadedFileIds.map((photoId) => ({
            arrivalId: arrival.id,
            photo: photoId,
            createdBy: userId,
            updatedBy: userId,
          })),
        });
      }

      await tx.arrivalItems.deleteMany({
        where: {
          arrivalId: arrival.id,
        },
      });

      await tx.arrivalItems.createMany({
        data: validatedBreaks.map((item) => ({
          arrivalId: arrival.id,
          materialId: item.materialId,
          conditionId: item.conditionId,
          conditionCategory: item.conditionCategory,
          quantity: item.quantity,
          itemName: item.itemName,
          createdBy: userId,
          updatedBy: userId,
        })),
      });

      await tx.arrivalStatuses.create({
        data: {
          arrivalId: arrival.id,
          status: ArrivalStatus.WAITING_ARRIVAL,
          statusQc: ArrivalStatus.QC_PENDING,
          statusWeighing: ArrivalStatus.WEIGHING_PENDING,
          createdBy: userId,
        },
      });
          // notifyClients(arrival.idKedatangan);
      await tx.notifications.create({
        data: {
          table: "arrivals",
          description:arrival.idKedatangan,
        },
      });
    }); // <-- Add this closing parenthesis for $transaction
      return {
        success: true,
        message: `Material submitted successfully!`,
      };
  } catch (error: any) {
    console.error("Error processing Material:", error);
    return {
      success: false,
      message: "Failed to process Material due to a server error.",
    };
  }
};

export const createOrUpdateArrivalItem = async (
  prevState: FormState,
    formData: FormData
): Promise<FormState> => {
    try {
        console.log('Received form dataaaaaaaa:', formData);

        const validatedFields = arrivalItemSchema.safeParse({
          id: formData.get("id"),
          arrivalId: formData.get("arrivalId"),
          materialId: formData.get("materialId"),
          quantity: formData.get("quantity"),
          conditionCategory: formData.get("conditionCategory"),
          conditionId: formData.get("conditionId"),
          itemName: formData.get("itemName"),
          description: formData.get("description"),
        });

        if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
        }
        console.log("validated data ", validatedFields);
        const { userId } = await getAuthenticatedUserInfo();

        if (formData.get("id")) {
          // Update existing item
            await prisma.arrivalItems.update({
            where: {
              id: Number(formData.get("id"))
            },
            data: {
              materialId: validatedFields.data.materialId,
              quantity: validatedFields.data.quantity,
              conditionCategory: validatedFields.data.conditionCategory,
              conditionId: validatedFields.data.conditionId,
              itemName: validatedFields.data.itemName,
              updatedBy: userId
            },
          });
        } else {
          // Insert new item
          await prisma.arrivalItems.createMany({
            data: {
              arrivalId: Number(validatedFields.data.arrivalId) || 0,
              materialId: validatedFields.data.materialId,
              quantity: validatedFields.data.quantity,
              conditionCategory: validatedFields.data.conditionCategory,
              conditionId: validatedFields.data.conditionId,
              itemName: validatedFields.data.itemName,
              createdBy: userId,
              updatedBy: userId
            },
          });
        }
        console.log("data berhasil di simpan");
        return {
          success: true,
          message: `Arrival Item ${formData.get("id") ? 'updated' : 'created'} successfully!`,
        };
    } catch (error: any) {
          console.error("Error processing Arrival Item:", error);
        return {
          success: false,
          message: "Failed to process Arrival Item due to a server error.",
        };
    }
}

export const getArrivalByArrivalId = async (arrivalId: string) => {
  try {
    const arrival = await prisma.arrivals.findFirst({
      where: { idKedatangan: arrivalId },
      include: {
        supplier: true,
        ArrivalStatuses: true,
        ArrivalItems: {
          include: {
            material: true,
            condition: true,
            parameter: true,
          },
        },
      },
    });
    if (!arrival) {
      return { success: false, message: "Arrival not found." };
    }
    return { success: true, data: arrival };
  } catch (error) {
    console.error("Error fetching Arrival by ID:", error);
    return { success: false, message: "Failed to fetch Arrival." };
  }
}

export const approve = async (id: number, status: string, note?: string | null) => {
  try {
    const { userId } = await getAuthenticatedUserInfo();
    const updatedArrival = await prisma.arrivals.update({
      where: { id: id },
      data: {
        updatedBy: userId,
        note: note || null,
      },
    });
    const arrivalStatus = await prisma.arrivalStatuses.findFirst({
      where: { arrivalId: id },
      select: {
        id: true,
      },
    });
    if (arrivalStatus) {
      await prisma.arrivalStatuses.update({
        where: { id: arrivalStatus.id },
        data: {
          status: status,
          statusApproval: ArrivalStatus.APPROVAL_COMPLETED,
          updatedBy: userId,
        },
      });
    }
    await prisma.notifications.create({
      data: {
        table: "arrivals",
        description: updatedArrival.idKedatangan,
      },
    });
    console.log("Updated Arrival:", updatedArrival);
    return { success: true, message: `Antrian berhasil di konfirmasi` };
  } catch (error) {
    console.error("Error updating Arrival status:", error);
    return { success: false, message: "Failed to update Arrival status." };
  }
};

import prisma from "@/lib/prisma";
import FormModal from "./FormModal";

export type FormContainerProps = {
  table:
    | "supplier"
    | "user"
    | "material"
    | "condition"
    | "parameter"
    ;
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};


  if (type !== "delete") {
    switch (table) {
      
      // case "teacher":
      //   const teacherSubjects = await prisma.subject.findMany({
      //     select: { id: true, name: true },
      //   });
      //   relatedData = { subjects: teacherSubjects };
      //   break;
      // case "student":
      //   const studentGrades = await prisma.grade.findMany({
      //     select: { id: true, level: true },
      //   });
      //   const studentClasses = await prisma.class.findMany({
      //     include: { _count: { select: { students: true } } },
      //   });
      //   relatedData = { classes: studentClasses, grades: studentGrades };
      //   break;
      // case "exam":
      //   const examLessons = await prisma.lesson.findMany({
      //     where: {
      //       ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
      //     },
      //     select: { id: true, name: true },
      //   });
      //   relatedData = { lessons: examLessons };
      //   break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;

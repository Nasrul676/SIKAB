import Swal from "sweetalert2";

export function showAlert(message: string, type: "success" | "error" | "info" | "warning") {
  Swal.fire({
    title: type.charAt(0).toUpperCase() + type.slice(1),
    text: message,
    icon: type,
    confirmButtonText: "OK",
  });
}

export function showErrorAlert(message: string) {
  Swal.fire({
    title: "Gagal",
    text: message,
    icon: "error",
    confirmButtonText: "OK",
  });
}

export function showSuccessAlert(message: string) {
  Swal.fire({
    title: "Berhasil",
    text: message,
    icon: "success",
    confirmButtonText: "OK",
  });
}

export function showInfoAlert(message: string) {
  Swal.fire({
    title: "Info",
    text: message,
    icon: "info",
    confirmButtonText: "OK",
  });
}

export function showWarningAlert(message: string) {
  Swal.fire({
    title: "Peringatan",
    text: message,
    icon: "warning",
    confirmButtonText: "OK",
  });
}

export function showConfirmationAlert(message: string, onConfirm: () => void) {
  Swal.fire({
    title: "Anda yakin ?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}

export function showAlertLoading(message: string) {
  Swal.fire({
    title: "Loading",
    text: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}
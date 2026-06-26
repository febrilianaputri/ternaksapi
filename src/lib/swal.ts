"use client";

import Swal from "sweetalert2";

export const swalSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    timer: 2500,
    showConfirmButton: false,
    background: "#f0fdf4",
    color: "#166534",
    customClass: {
      title: "text-green-700 font-semibold",
      htmlContainer: "text-green-600",
    },
  });
};

export const swalError = (title: string, text?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "OK",
    background: "#fef2f2",
    color: "#991b1b",
    customClass: {
      title: "text-red-700 font-semibold",
      htmlContainer: "text-red-600",
    },
  });
};

export const swalWarning = (title: string, text?: string) => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonText: "OK",
    background: "#fffbeb",
    color: "#92400e",
  });
};

export const swalInfo = (title: string, text?: string) => {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonText: "OK",
    background: "#f5f0e8",
    color: "#5c4a32",
    customClass: {
      title: "text-amber-800 font-semibold",
      htmlContainer: "text-amber-700",
    },
  });
};

export const swalConfirm = (
  title: string,
  text: string,
  confirmText = "Ya",
  cancelText = "Batal"
): Promise<boolean> => {
  return Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    background: "#ffffff",
    reverseButtons: true,
  }).then((result) => result.isConfirmed);
};

export default Swal;

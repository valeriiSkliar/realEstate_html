import { createAndShowToast, FormManager, schemas } from "../forms/index.js";

export function initializeReportForm() {
  const reportFormElement = document.getElementById("reportAdForm");
  if (reportFormElement) {
    const reportFormManager = new FormManager(reportFormElement, {
      schema: schemas.reportAd,
      onSubmit: async (data) => {
        console.log("Report submitted:", data);
        // Simulate server request
        await new Promise((resolve) => setTimeout(resolve, 1000));
        createAndShowToast("Ваша жалоба успешно отправлена!", "success");
        return { success: true };
      },
      onError: (errors) => {
        console.log("Report form errors:", errors);
        createAndShowToast("Пожалуйста, исправьте ошибки в форме.", "danger");
      },
      resetOnSuccess: true,
    });

    // Apply bootstrap styles
    // formAdapters.bootstrap.applyStyles(reportFormElement);
  }
}

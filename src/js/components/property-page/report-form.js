import { FormManager, schemas } from "../../forms/index.js";
import { createAndShowToast } from "../../utils/uiHelpers.js";

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

    // Сохраняем ссылку на FormManager в элементе формы для внешнего доступа
    reportFormElement._formManager = reportFormManager;

    // Apply bootstrap styles
    // formAdapters.bootstrap.applyStyles(reportFormElement);
  }
}

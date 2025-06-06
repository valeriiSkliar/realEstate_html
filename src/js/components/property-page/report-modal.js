import { hideModal, showModal } from "../../utils/uiHelpers.js";
import { initializeReportForm } from "./report-form.js";

/**
 * Компонент для управления модальным окном с формой жалобы на объявление
 */
export class ReportModal {
  constructor() {
    this.modalId = "reportModal";
    this.isInitialized = false;
  }

  /**
   * Инициализация компонента
   */
  init() {
    if (this.isInitialized) return;

    this.createModalHtml();
    this.bindReportButton();
    this.initializeForm();
    this.isInitialized = true;
  }

  /**
   * Создание HTML разметки модального окна
   */
  createModalHtml() {
    // Проверяем, не существует ли уже модальное окно
    if (document.getElementById(this.modalId)) {
      return;
    }

    const modalHtml = `
      <div class="modal fade" id="${this.modalId}" tabindex="-1" aria-labelledby="reportModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="reportModalLabel">Пожаловаться на объявление</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
            </div>
            <div class="modal-body">
              <p class="text-muted mb-3">
                Если вы считаете, что это объявление нарушает правила сайта, 
                пожалуйста, опишите проблему в форме ниже.
              </p>
              <form id="reportAdForm" novalidate>
                <div class="form-field mb-3">
                  <label for="reportDescription" class="form-label required">
                    Причина жалобы
                  </label>
                  <textarea
                    id="reportDescription"
                    name="description"
                    class="form-input"
                    rows="4"
                    placeholder="Опишите, что не так с этим объявлением..."
                  ></textarea>
                </div>
                <div class="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    class="brand-button brand-button--outline brand-button--pink"
                    data-bs-dismiss="modal"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    class="brand-button brand-button--solid brand-button--turquoise"
                  >
                    Отправить жалобу
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    // Добавляем модальное окно в конец body
    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }

  /**
   * Привязка обработчика к кнопке "Пожаловаться"
   */
  bindReportButton() {
    // Ищем кнопку "Пожаловаться" по тексту или классу
    const reportButtons = document.querySelectorAll("[data-action='report']");

    reportButtons.forEach((button) => {
      if (button.textContent.trim() === "Пожаловаться") {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          this.show();
        });
      }
    });

    // Также добавляем обработчик для обычных кнопок с классом report-btn
    const reportBtns = document.querySelectorAll(
      '.report-btn, [data-action="report"]'
    );
    reportBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.show();
      });
    });
  }

  /**
   * Инициализация формы жалобы
   */
  initializeForm() {
    // Инициализируем форму после создания модального окна
    setTimeout(() => {
      initializeReportForm();

      // Добавляем обработчик успешной отправки для закрытия модального окна
      const form = document.getElementById("reportAdForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          // Закрываем модальное окно через небольшую задержку после успешной отправки
          setTimeout(() => {
            this.hide();
          }, 2000); // Даем время показать toast с успешным сообщением
        });
      }
    }, 100);
  }

  /**
   * Показать модальное окно
   */
  show() {
    showModal(this.modalId);
  }

  /**
   * Скрыть модальное окно
   */
  hide() {
    hideModal(this.modalId);
  }

  /**
   * Сброс формы
   */
  resetForm() {
    const form = document.getElementById("reportAdForm");
    if (form) {
      form.reset();
      // Удаляем классы валидации
      const inputs = form.querySelectorAll(".form-input");
      inputs.forEach((input) => {
        input.classList.remove("is-invalid", "is-valid");
      });
    }
  }

  /**
   * Уничтожение компонента
   */
  destroy() {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      this.hide();
      modal.remove();
    }
    this.isInitialized = false;
  }
}

/**
 * Функция для простой инициализации компонента
 */
export function initReportModal() {
  const reportModal = new ReportModal();
  reportModal.init();
  return reportModal;
}

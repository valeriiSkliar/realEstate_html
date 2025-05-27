const schemas = {
  registration: {
    firstName: [
      validators.required(),
      validators.minLength(2, "Имя должно содержать минимум 2 символа"),
    ],
    lastName: [
      validators.required(),
      validators.minLength(2, "Фамилия должна содержать минимум 2 символа"),
    ],
    email: [validators.required(), validators.email()],
    phone: [validators.phone()],
    password: [
      validators.required(),
      validators.minLength(8, "Пароль должен содержать минимум 8 символов"),
      validators.pattern(
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/,
        "Пароль должен содержать цифры, строчные и заглавные буквы"
      ),
    ],
    confirmPassword: [
      validators.required(),
      validators.custom((value, formData) => {
        return value === formData.get("password");
      }, "Пароли не совпадают"),
    ],
    age: [
      validators.min(18, "Вам должно быть минимум 18 лет"),
      validators.max(99, "Пожалуйста, введите корректный возраст"),
    ],
    agreement: [
      validators.custom(
        (value) => value === "on" || value === true,
        "Необходимо согласие с условиями"
      ),
    ],
  },

  // Пример схемы для формы обратной связи
  contact: {
    name: [validators.required("Пожалуйста, введите ваше имя")],
    email: [
      validators.required("Email обязателен для обратной связи"),
      validators.email(),
    ],
    message: [
      validators.required("Пожалуйста, введите сообщение"),
      validators.minLength(
        10,
        "Сообщение должно содержать минимум 10 символов"
      ),
    ],
  },

  // Пример схемы для недвижимости
  realEstate: {
    title: [
      validators.required("Введите название объекта"),
      validators.minLength(5),
      validators.maxLength(100),
    ],
    price: [
      validators.required("Укажите цену"),
      validators.min(0, "Цена не может быть отрицательной"),
    ],
    area: [
      validators.required("Укажите площадь"),
      validators.min(1, "Площадь должна быть больше 0"),
    ],
    propertyType: [
      validators.required("Выберите тип недвижимости"),
      validators.oneOf(["apartment", "house", "commercial", "land"]),
    ],
    description: [
      validators.maxLength(1000, "Описание не должно превышать 1000 символов"),
    ],
  },
};

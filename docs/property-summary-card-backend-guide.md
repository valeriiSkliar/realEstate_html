# Property Summary Card - Руководство для Backend разработчика

## Обзор

Карточка недвижимости (`property-summary-card`) представляет собой компонент для отображения краткой информации об объекте недвижимости. Вся разметка генерируется на сервере, JavaScript отвечает только за интерактивность (избранное, анимации).

## Базовая структура HTML

### Минимальная разметка

```html
<div
  class="property-summary-card"
  data-component="property-summary-card"
  data-property-id="{PROPERTY_ID}"
>
  <!-- Иконка избранного -->
  <div
    class="property-summary-card__favorite-icon"
    role="button"
    aria-label="Добавить в избранное"
    tabindex="0"
    data-favorite="false"
  >
    <!-- Пустое сердечко (по умолчанию) -->
    <svg
      class="property-summary-card__heart-empty"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--brand-bright-pink)"
      stroke-width="2"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      ></path>
    </svg>
    <!-- Заполненное сердечко (скрыто по умолчанию) -->
    <svg
      class="property-summary-card__heart-filled"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="var(--brand-bright-pink)"
      stroke="var(--brand-bright-pink)"
      stroke-width="2"
      style="display: none;"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      ></path>
    </svg>
  </div>

  <!-- Заголовок -->
  <h3 class="property-summary-card__title text-light-gray-30">
    <a href="/property/{PROPERTY_ID}">{PROPERTY_TITLE}</a>
  </h3>

  <!-- Цена -->
  <p class="property-summary-card__price">{PROPERTY_PRICE}</p>

  <!-- Детали -->
  <ul class="property-summary-card__details-list">
    <!-- Детали генерируются динамически -->
  </ul>

  <!-- Контакт агента (опционально) -->
  <!-- Блок добавляется только если есть данные агента -->
</div>
```

## Обязательные атрибуты

### Корневой элемент

- `data-component="property-summary-card"` - идентификатор компонента
- `data-property-id="{PROPERTY_ID}"` - **ОБЯЗАТЕЛЬНО** уникальный ID объекта недвижимости

### Иконка избранного

- `data-favorite="false"` - состояние избранного (false/true)
- `aria-label` - текст для скринридеров
- `role="button"` и `tabindex="0"` - для доступности

## Состояния избранного

### Не в избранном (по умолчанию)

```html
<div class="property-summary-card__favorite-icon"
     role="button"
     aria-label="Добавить в избранное"
     tabindex="0"
     data-favorite="false">
    <!-- Пустое сердечко видимо -->
    <svg class="property-summary-card__heart-empty" ...>
    <!-- Заполненное сердечко скрыто -->
    <svg class="property-summary-card__heart-filled" ... style="display: none;">
</div>
```

### В избранном

```html
<div class="property-summary-card__favorite-icon property-summary-card__favorite-icon--active"
     role="button"
     aria-label="Удалить из избранного"
     tabindex="0"
     data-favorite="true">
    <!-- Пустое сердечко скрыто -->
    <svg class="property-summary-card__heart-empty" ... style="display: none;">
    <!-- Заполненное сердечко видимо -->
    <svg class="property-summary-card__heart-filled" ...>
</div>
```

## Генерация деталей недвижимости

### Структура детали

```html
<li class="property-summary-card__detail-item">
  <span class="property-summary-card__detail-label">{LABEL}</span>
  <span class="property-summary-card__detail-value">{VALUE}</span>
</li>
```

### Примеры деталей для разных типов недвижимости

#### Квартира

```html
<ul class="property-summary-card__details-list">
  <li class="property-summary-card__detail-item">
    <span class="property-summary-card__detail-label">Площадь</span>
    <span class="property-summary-card__detail-value">65 м²</span>
  </li>
  <li class="property-summary-card__detail-item">
    <span class="property-summary-card__detail-label">Комнаты</span>
    <span class="property-summary-card__detail-value">2</span>
  </li>
  <li class="property-summary-card__detail-item">
    <span class="property-summary-card__detail-label">Этаж</span>
    <span class="property-summary-card__detail-value">5/9</span>
  </li>
  <li class="property-summary-card__detail-item">
    <span class="property-summary-card__detail-label">Район</span>
    <span class="property-summary-card__detail-value">Центральный</span>
  </li>
</ul>
```

#### Дом

```html
<ul class="property-summary-card__details-list">
  <li class="property-summary-card__detail-item">
    <span class="property-summary-card__detail-label">Площадь дома</span>
    <span class="property-summary-card__detail-value">150 м²</span>
  </li>
  <li class="property-summary-card__detail-item">
    <span class="property-summary-card__detail-label">Участок</span>
    <span class="property-summary-card__detail-value">6 соток</span>
  </li>
  <li class="property-summary-card__detail-item">
    <span class="property-summary-card__detail-label">Комнаты</span>
    <span class="property-summary-card__detail-value">4</span>
  </li>
</ul>
```

#### Коммерческая недвижимость

```html
<ul class="property-summary-card__details-list">
  <li class="property-summary-card__detail-item">
    <span class="property-summary-card__detail-label">Площадь</span>
    <span class="property-summary-card__detail-value">200 м²</span>
  </li>
  <li class="property-summary-card__detail-item">
    <span class="property-summary-card__detail-label">Тип</span>
    <span class="property-summary-card__detail-value">Офис</span>
  </li>
  <li class="property-summary-card__detail-item">
    <span class="property-summary-card__detail-label">Этаж</span>
    <span class="property-summary-card__detail-value">2/5</span>
  </li>
</ul>
```

## Контактная информация агента

### С агентом

```html
<div class="property-summary-card__phone">
  <span class="property-summary-card__phone-label">Агент:</span>
  <span class="property-summary-card__phone-agent-name">{AGENT_NAME}</span>
  <a href="tel:{PHONE_NUMBER}" class="property-summary-card__phone-link">
    📞 {FORMATTED_PHONE}
  </a>
</div>
```

### Без имени агента

```html
<div class="property-summary-card__phone">
  <span class="property-summary-card__phone-label">Контакт:</span>
  <a href="tel:{PHONE_NUMBER}" class="property-summary-card__phone-link">
    📞 {FORMATTED_PHONE}
  </a>
</div>
```

### Без контактной информации

Блок `property-summary-card__phone` полностью исключается из разметки.

## Форматирование данных

### Цена

- `"2 500 000 ₽"` - стандартный формат с пробелами
- `"Цена по запросу"` - для объектов без фиксированной цены
- `"от 1 200 000 ₽"` - для диапазона цен

### Телефон

- `href="tel:+79001234567"` - международный формат без пробелов
- Отображаемый текст: `"+7 (900) 123-45-67"` - с форматированием

### Площадь

- `"65 м²"` - с символом квадратного метра
- `"6 соток"` - для участков

## Логика определения избранного на сервере (Yii)

```php
<?php
// Пример для Yii Framework

/**
 * Проверяет, находится ли объект в избранном у пользователя
 * @param int $propertyId ID объекта недвижимости
 * @param int $userId ID пользователя
 * @return bool
 */
function isPropertyFavorite($propertyId, $userId) {
    // Пример запроса к базе данных
    return (bool) Yii::$app->db->createCommand(
        'SELECT COUNT(*) FROM user_favorites WHERE user_id = :userId AND property_id = :propertyId'
    )->bindValues([
        ':userId' => $userId,
        ':propertyId' => $propertyId
    ])->queryScalar();
}

/**
 * Возвращает атрибуты для иконки избранного
 * @param bool $isFavorite
 * @return array
 */
function renderFavoriteState($isFavorite) {
    if ($isFavorite) {
        return [
            'dataFavorite' => 'true',
            'cssClass' => 'property-summary-card__favorite-icon--active',
            'ariaLabel' => 'Удалить из избранного',
            'emptyHeartStyle' => 'display: none;',
            'filledHeartStyle' => ''
        ];
    } else {
        return [
            'dataFavorite' => 'false',
            'cssClass' => '',
            'ariaLabel' => 'Добавить в избранное',
            'emptyHeartStyle' => '',
            'filledHeartStyle' => 'display: none;'
        ];
    }
}

/**
 * Форматирует цену для отображения
 * @param float|null $price
 * @return string
 */
function formatPrice($price) {
    if ($price === null || $price <= 0) {
        return 'Цена по запросу';
    }

    return number_format($price, 0, ',', ' ') . ' ₽';
}

/**
 * Форматирует телефон для отображения
 * @param string $phone
 * @return array ['raw' => '+79001234567', 'formatted' => '+7 (900) 123-45-67']
 */
function formatPhone($phone) {
    // Очищаем телефон от всех символов кроме цифр
    $clean = preg_replace('/[^0-9]/', '', $phone);

    // Добавляем +7 если номер начинается с 8 или 9
    if (strlen($clean) === 11 && $clean[0] === '8') {
        $clean = '7' . substr($clean, 1);
    } elseif (strlen($clean) === 10 && $clean[0] === '9') {
        $clean = '7' . $clean;
    }

    $raw = '+' . $clean;

    // Форматируем для отображения
    if (strlen($clean) === 11 && $clean[0] === '7') {
        $formatted = '+7 (' . substr($clean, 1, 3) . ') ' .
                    substr($clean, 4, 3) . '-' .
                    substr($clean, 7, 2) . '-' .
                    substr($clean, 9, 2);
    } else {
        $formatted = $raw;
    }

    return [
        'raw' => $raw,
        'formatted' => $formatted
    ];
}
?>
```

## Пример Yii View

```php
<?php
use yii\helpers\Html;
use yii\helpers\Url;

/* @var $property app\models\Property */
/* @var $user app\models\User */

$favoriteState = renderFavoriteState(isPropertyFavorite($property->id, $user->id));
$phoneData = $property->agent_phone ? formatPhone($property->agent_phone) : null;
?>

<div class="property-summary-card" data-component="property-summary-card" data-property-id="<?= $property->id ?>">
    <!-- Иконка избранного -->
    <div class="property-summary-card__favorite-icon <?= $favoriteState['cssClass'] ?>"
         role="button"
         aria-label="<?= $favoriteState['ariaLabel'] ?>"
         tabindex="0"
         data-favorite="<?= $favoriteState['dataFavorite'] ?>">
        <!-- Пустое сердечко -->
        <svg class="property-summary-card__heart-empty"
             style="<?= $favoriteState['emptyHeartStyle'] ?>"
             width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="var(--brand-bright-pink)" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <!-- Заполненное сердечко -->
        <svg class="property-summary-card__heart-filled"
             style="<?= $favoriteState['filledHeartStyle'] ?>"
             width="20" height="20" viewBox="0 0 24 24"
             fill="var(--brand-bright-pink)" stroke="var(--brand-bright-pink)" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
    </div>

    <!-- Заголовок -->
    <h3 class="property-summary-card__title text-light-gray-30">
        <?= Html::a(Html::encode($property->title), Url::to(['property/view', 'id' => $property->id])) ?>
    </h3>

    <!-- Цена -->
    <p class="property-summary-card__price"><?= formatPrice($property->price) ?></p>

    <!-- Детали -->
    <ul class="property-summary-card__details-list">
        <?php if ($property->area): ?>
        <li class="property-summary-card__detail-item">
            <span class="property-summary-card__detail-label">Площадь</span>
            <span class="property-summary-card__detail-value"><?= $property->area ?> м²</span>
        </li>
        <?php endif; ?>

        <?php if ($property->rooms): ?>
        <li class="property-summary-card__detail-item">
            <span class="property-summary-card__detail-label">Комнаты</span>
            <span class="property-summary-card__detail-value"><?= $property->rooms ?></span>
        </li>
        <?php endif; ?>

        <?php if ($property->floor && $property->total_floors): ?>
        <li class="property-summary-card__detail-item">
            <span class="property-summary-card__detail-label">Этаж</span>
            <span class="property-summary-card__detail-value"><?= $property->floor ?>/<?= $property->total_floors ?></span>
        </li>
        <?php endif; ?>

        <?php if ($property->district): ?>
        <li class="property-summary-card__detail-item">
            <span class="property-summary-card__detail-label">Район</span>
            <span class="property-summary-card__detail-value"><?= Html::encode($property->district) ?></span>
        </li>
        <?php endif; ?>

        <?php if ($property->type === 'house' && $property->land_area): ?>
        <li class="property-summary-card__detail-item">
            <span class="property-summary-card__detail-label">Участок</span>
            <span class="property-summary-card__detail-value"><?= $property->land_area ?> соток</span>
        </li>
        <?php endif; ?>

        <?php if ($property->type === 'commercial' && $property->commercial_type): ?>
        <li class="property-summary-card__detail-item">
            <span class="property-summary-card__detail-label">Тип</span>
            <span class="property-summary-card__detail-value"><?= Html::encode($property->commercial_type) ?></span>
        </li>
        <?php endif; ?>
    </ul>

    <!-- Контакт агента -->
    <?php if ($phoneData): ?>
    <div class="property-summary-card__phone">
        <span class="property-summary-card__phone-label">
            <?= $property->agent_name ? 'Агент:' : 'Контакт:' ?>
        </span>
        <?php if ($property->agent_name): ?>
        <span class="property-summary-card__phone-agent-name">
            <?= Html::encode($property->agent_name) ?>
        </span>
        <?php endif; ?>
        <a href="tel:<?= $phoneData['raw'] ?>" class="property-summary-card__phone-link">
            📞 <?= $phoneData['formatted'] ?>
        </a>
    </div>
    <?php endif; ?>
</div>
```

## Пример модели Property (Yii ActiveRecord)

```php
<?php
namespace app\models;

use yii\db\ActiveRecord;

/**
 * Property model
 *
 * @property int $id
 * @property string $title
 * @property float $price
 * @property float $area
 * @property int $rooms
 * @property int $floor
 * @property int $total_floors
 * @property string $district
 * @property string $type (apartment|house|commercial)
 * @property float $land_area
 * @property string $commercial_type
 * @property string $agent_name
 * @property string $agent_phone
 */
class Property extends ActiveRecord
{
    public static function tableName()
    {
        return 'properties';
    }

    /**
     * Получить детали для отображения в карточке
     * @return array
     */
    public function getCardDetails()
    {
        $details = [];

        if ($this->area) {
            $details[] = [
                'label' => $this->type === 'house' ? 'Площадь дома' : 'Площадь',
                'value' => $this->area . ' м²'
            ];
        }

        if ($this->rooms) {
            $details[] = [
                'label' => 'Комнаты',
                'value' => $this->rooms
            ];
        }

        if ($this->floor && $this->total_floors) {
            $details[] = [
                'label' => 'Этаж',
                'value' => $this->floor . '/' . $this->total_floors
            ];
        }

        if ($this->district) {
            $details[] = [
                'label' => 'Район',
                'value' => $this->district
            ];
        }

        if ($this->type === 'house' && $this->land_area) {
            $details[] = [
                'label' => 'Участок',
                'value' => $this->land_area . ' соток'
            ];
        }

        if ($this->type === 'commercial' && $this->commercial_type) {
            $details[] = [
                'label' => 'Тип',
                'value' => $this->commercial_type
            ];
        }

        return $details;
    }
}
```

## Важные замечания

1. **Обязательный атрибут**: `data-property-id` должен быть уникальным идентификатором объекта
2. **SVG иконки**: Используйте точно такую же разметку SVG для корректной работы стилей
3. **Состояние избранного**: Управляется через `data-favorite` и CSS классы
4. **Доступность**: Обязательно включайте `aria-label`, `role` и `tabindex` для иконки избранного
5. **Телефонные ссылки**: Используйте формат `tel:+79001234567` без пробелов и скобок
6. **Условные блоки**: Блок агента добавляется только при наличии контактных данных
7. **Экранирование**: Всегда используйте `Html::encode()` для пользовательских данных

## Тестирование

Для проверки корректности разметки:

1. Убедитесь, что каждая карточка имеет уникальный `data-property-id`
2. Проверьте корректность телефонных ссылок
3. Убедитесь в наличии всех обязательных CSS классов
4. Проверьте доступность с помощью скринридера
5. Протестируйте состояния избранного

## События JavaScript

После рендеринга карточек JavaScript автоматически:

- Загружает состояние избранного из localStorage
- Обновляет визуальное состояние карточек
- Привязывает обработчики событий

Никаких дополнительных действий от backend не требуется.

# Breadcrumb Component - Руководство для Backend разработчика

## Обзор

Компонент breadcrumb (хлебные крошки) предназначен для навигации по иерархии страниц сайта. Вся разметка генерируется на сервере, JavaScript отвечает только за обработку кликов и навигацию.

## Базовая структура HTML

### Минимальная разметка

```html
<nav class="breadcrumb" aria-label="Breadcrumb navigation" role="navigation">
  <ol class="breadcrumb-list">
    <li class="breadcrumb-item">
      <a class="breadcrumb-link" href="/">Главная</a>
    </li>
    <li class="breadcrumb-item">
      <a class="breadcrumb-link" href="/catalog">Каталог</a>
    </li>
    <li class="breadcrumb-item active-page">
      <span class="breadcrumb-text">Текущая страница</span>
    </li>
  </ol>
</nav>
```

## Обязательные атрибуты и классы

### Корневой элемент

- `class="breadcrumb"` - основной CSS класс компонента
- `aria-label="Breadcrumb navigation"` - для доступности
- `role="navigation"` - семантическая роль для скринридеров

### Список элементов

- `class="breadcrumb-list"` - контейнер для элементов навигации

### Элементы навигации

- `class="breadcrumb-item"` - базовый класс для каждого элемента
- `class="breadcrumb-link"` - для ссылок
- `class="breadcrumb-text"` - для текста без ссылки (обычно последний элемент)

## Типы элементов и их стилизация

### Обычный элемент (серый фон)

```html
<li class="breadcrumb-item">
  <a class="breadcrumb-link" href="/catalog">Каталог</a>
</li>
```

### Активная страница (желтый фон)

```html
<li class="breadcrumb-item active-page">
  <span class="breadcrumb-text">Текущая страница</span>
</li>
```

### Выделенный элемент - бирюзовый

```html
<li class="breadcrumb-item highlight-turquoise">
  <a class="breadcrumb-link" href="/">Главная</a>
</li>
```

### Выделенный элемент - желтый

```html
<li class="breadcrumb-item highlight-yellow">
  <a class="breadcrumb-link" href="/special">Специальная страница</a>
</li>
```

## Полный пример с разными типами элементов

```html
<nav class="breadcrumb" aria-label="Breadcrumb navigation" role="navigation">
  <ol class="breadcrumb-list">
    <!-- Главная страница - бирюзовый -->
    <li class="breadcrumb-item highlight-turquoise">
      <a class="breadcrumb-link" href="/">Главная</a>
    </li>

    <!-- Обычный элемент - серый -->
    <li class="breadcrumb-item">
      <a class="breadcrumb-link" href="/catalog">Каталог</a>
    </li>

    <!-- Категория - серый -->
    <li class="breadcrumb-item">
      <a class="breadcrumb-link" href="/catalog/apartments">Квартиры</a>
    </li>

    <!-- Подкатегория - серый -->
    <li class="breadcrumb-item">
      <a class="breadcrumb-link" href="/catalog/apartments/new-buildings"
        >Новостройки</a
      >
    </li>

    <!-- Текущая страница - желтый, без ссылки -->
    <li class="breadcrumb-item active-page">
      <span class="breadcrumb-text">ЖК "Солнечный"</span>
    </li>
  </ol>
</nav>
```

## Логика генерации breadcrumb (Yii)

```php
<?php
/**
 * Генератор breadcrumb для Yii Framework
 */

/**
 * Структура элемента breadcrumb
 */
class BreadcrumbItem {
    public $text;
    public $url;
    public $isActive;
    public $highlightType; // null, 'turquoise', 'yellow'

    public function __construct($text, $url = null, $isActive = false, $highlightType = null) {
        $this->text = $text;
        $this->url = $url;
        $this->isActive = $isActive;
        $this->highlightType = $highlightType;
    }
}

/**
 * Генерирует массив элементов breadcrumb
 * @param array $items Массив элементов
 * @return array
 */
function generateBreadcrumbItems($items) {
    $breadcrumbItems = [];

    foreach ($items as $index => $item) {
        $isLast = ($index === count($items) - 1);
        $breadcrumbItems[] = new BreadcrumbItem(
            $item['text'],
            $isLast ? null : $item['url'], // Последний элемент без ссылки
            $isLast, // Последний элемент активный
            $item['highlight'] ?? null
        );
    }

    return $breadcrumbItems;
}

/**
 * Генерирует CSS классы для элемента breadcrumb
 * @param BreadcrumbItem $item
 * @return string
 */
function getBreadcrumbItemClasses($item) {
    $classes = ['breadcrumb-item'];

    if ($item->isActive) {
        $classes[] = 'active-page';
    } elseif ($item->highlightType === 'turquoise') {
        $classes[] = 'highlight-turquoise';
    } elseif ($item->highlightType === 'yellow') {
        $classes[] = 'highlight-yellow';
    }

    return implode(' ', $classes);
}

/**
 * Автоматическая генерация breadcrumb на основе URL
 * @param string $currentUrl
 * @param array $urlMapping Маппинг URL на названия
 * @return array
 */
function generateBreadcrumbFromUrl($currentUrl, $urlMapping = []) {
    $items = [];

    // Всегда добавляем главную страницу
    $items[] = [
        'text' => 'Главная',
        'url' => '/',
        'highlight' => 'turquoise'
    ];

    // Разбираем URL на части
    $urlParts = array_filter(explode('/', trim($currentUrl, '/')));
    $currentPath = '';

    foreach ($urlParts as $index => $part) {
        $currentPath .= '/' . $part;
        $isLast = ($index === count($urlParts) - 1);

        // Получаем название из маппинга или используем часть URL
        $text = $urlMapping[$currentPath] ?? ucfirst(str_replace(['-', '_'], ' ', $part));

        $items[] = [
            'text' => $text,
            'url' => $isLast ? null : $currentPath,
            'highlight' => null
        ];
    }

    return $items;
}

/**
 * Генерирует breadcrumb для страницы недвижимости
 * @param object $property Объект недвижимости
 * @return array
 */
function generatePropertyBreadcrumb($property) {
    $items = [
        [
            'text' => 'Главная',
            'url' => '/',
            'highlight' => 'turquoise'
        ],
        [
            'text' => 'Каталог',
            'url' => '/catalog'
        ]
    ];

    // Добавляем тип недвижимости
    if ($property->type) {
        $items[] = [
            'text' => $property->getTypeDisplayName(),
            'url' => '/catalog/' . $property->type
        ];
    }

    // Добавляем город
    if ($property->city) {
        $items[] = [
            'text' => $property->city,
            'url' => '/catalog/' . $property->type . '/' . $property->city_slug
        ];
    }

    // Добавляем район (если есть)
    if ($property->district) {
        $items[] = [
            'text' => $property->district,
            'url' => '/catalog/' . $property->type . '/' . $property->city_slug . '/' . $property->district_slug
        ];
    }

    // Текущий объект (без ссылки)
    $items[] = [
        'text' => $property->title,
        'url' => null
    ];

    return $items;
}
?>
```

## Пример Yii View

```php
<?php
use yii\helpers\Html;
use yii\helpers\Url;

/* @var $breadcrumbItems array Массив элементов breadcrumb */

if (empty($breadcrumbItems)) {
    return;
}
?>

<nav class="breadcrumb" aria-label="Breadcrumb navigation" role="navigation">
    <ol class="breadcrumb-list">
        <?php foreach ($breadcrumbItems as $item): ?>
            <li class="<?= getBreadcrumbItemClasses($item) ?>">
                <?php if ($item->url && !$item->isActive): ?>
                    <a class="breadcrumb-link" href="<?= Html::encode($item->url) ?>">
                        <?= Html::encode($item->text) ?>
                    </a>
                <?php else: ?>
                    <span class="breadcrumb-text">
                        <?= Html::encode($item->text) ?>
                    </span>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
    </ol>
</nav>
```

## Пример использования в контроллере

```php
<?php
// В контроллере
class PropertyController extends Controller {

    public function actionView($id) {
        $property = Property::findOne($id);

        if (!$property) {
            throw new NotFoundHttpException();
        }

        // Генерируем breadcrumb
        $breadcrumbData = generatePropertyBreadcrumb($property);
        $breadcrumbItems = generateBreadcrumbItems($breadcrumbData);

        return $this->render('view', [
            'property' => $property,
            'breadcrumbItems' => $breadcrumbItems
        ]);
    }

    public function actionIndex() {
        // Автоматическая генерация на основе URL
        $urlMapping = [
            '/catalog' => 'Каталог',
            '/catalog/apartments' => 'Квартиры',
            '/catalog/houses' => 'Дома',
            '/catalog/commercial' => 'Коммерческая недвижимость'
        ];

        $breadcrumbData = generateBreadcrumbFromUrl(
            Yii::$app->request->url,
            $urlMapping
        );
        $breadcrumbItems = generateBreadcrumbItems($breadcrumbData);

        return $this->render('index', [
            'breadcrumbItems' => $breadcrumbItems
        ]);
    }
}
?>
```

## Пример с использованием Yii Breadcrumbs Widget

```php
<?php
// Альтернативный способ через встроенный виджет Yii
use yii\widgets\Breadcrumbs;

// В контроллере или view
$this->params['breadcrumbs'][] = ['label' => 'Каталог', 'url' => ['/catalog/index']];
$this->params['breadcrumbs'][] = ['label' => 'Квартиры', 'url' => ['/catalog/apartments']];
$this->params['breadcrumbs'][] = $property->title;

// В layout
echo Breadcrumbs::widget([
    'homeLink' => [
        'label' => 'Главная',
        'url' => ['/site/index'],
        'class' => 'highlight-turquoise'
    ],
    'links' => isset($this->params['breadcrumbs']) ? $this->params['breadcrumbs'] : [],
    'options' => ['class' => 'breadcrumb-list'],
    'tag' => 'ol',
    'itemTemplate' => '<li class="breadcrumb-item">{link}</li>',
    'activeItemTemplate' => '<li class="breadcrumb-item active-page"><span class="breadcrumb-text">{link}</span></li>',
]);
?>
```

## Стилизация и темы

### Доступные классы выделения

1. **highlight-turquoise** - бирюзовый фон (обычно для главной страницы)
2. **highlight-yellow** - желтый фон (для специальных страниц)
3. **active-page** - желтый фон для текущей страницы (автоматически последний элемент)

### CSS переменные для кастомизации

```scss
// В вашем SCSS файле можно переопределить цвета
$breadcrumb-bg-default: #f5f6f4; // Серый фон по умолчанию
$breadcrumb-bg-active: #d1f000; // Желтый фон для активной страницы
$breadcrumb-bg-turquoise: #00c9dd; // Бирюзовый фон
$breadcrumb-text-color: #252736; // Цвет текста
$breadcrumb-separator: "▸"; // Символ разделителя
```

## Адаптивность

Компонент автоматически адаптируется под мобильные устройства:

- Уменьшается размер шрифта
- Сокращается внутренний отступ
- Включается горизонтальная прокрутка при необходимости

## Доступность (Accessibility)

1. **Семантическая разметка**: использует `<nav>`, `<ol>`, `<li>`
2. **ARIA атрибуты**: `aria-label`, `role="navigation"`
3. **Клавиатурная навигация**: все ссылки доступны через Tab
4. **Скринридеры**: правильная структура для чтения

## Важные замечания

1. **Последний элемент**: всегда должен быть без ссылки и с классом `active-page`
2. **Экранирование**: обязательно экранируйте пользовательский ввод через `Html::encode()`
3. **SEO**: используйте правильные URL для лучшей индексации
4. **Производительность**: кешируйте сложные breadcrumb для часто посещаемых страниц
5. **Длинные названия**: текст автоматически обрезается с многоточием

## Примеры для разных типов страниц

### Страница категории

```php
$breadcrumbData = [
    ['text' => 'Главная', 'url' => '/', 'highlight' => 'turquoise'],
    ['text' => 'Каталог', 'url' => '/catalog'],
    ['text' => 'Квартиры', 'url' => null] // Текущая страница
];
```

### Страница объекта недвижимости

```php
$breadcrumbData = [
    ['text' => 'Главная', 'url' => '/', 'highlight' => 'turquoise'],
    ['text' => 'Каталог', 'url' => '/catalog'],
    ['text' => 'Квартиры', 'url' => '/catalog/apartments'],
    ['text' => 'Краснодар', 'url' => '/catalog/apartments/krasnodar'],
    ['text' => 'ЖК "Солнечный"', 'url' => null]
];
```

### Страница поиска

```php
$breadcrumbData = [
    ['text' => 'Главная', 'url' => '/', 'highlight' => 'turquoise'],
    ['text' => 'Поиск', 'url' => '/search'],
    ['text' => 'Результаты поиска', 'url' => null]
];
```

## Тестирование

1. Проверьте корректность всех ссылок
2. Убедитесь в правильности последовательности элементов
3. Протестируйте на мобильных устройствах
4. Проверьте доступность с помощью скринридера
5. Убедитесь в корректном отображении длинных названий

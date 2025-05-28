# Pagination Component - Руководство для Backend разработчика

## Обзор

Компонент пагинации предназначен для навигации по страницам результатов. Вся разметка генерируется на сервере, JavaScript отвечает только за отслеживание кликов и отправку событий для аналитики.

## Базовая структура HTML

### Минимальная разметка

```html
<nav
  class="pagination-wrapper"
  aria-label="Page navigation"
  data-component="pagination"
>
  <ul class="pagination">
    <!-- Первая страница -->
    <li class="page-item">
      <a class="page-link" href="/search?page=1" aria-label="First">
        <i class="bi bi-chevron-bar-left"></i>
      </a>
    </li>

    <!-- Предыдущая страница -->
    <li class="page-item">
      <a
        class="page-link"
        href="/search?page={PREV_PAGE}"
        aria-label="Previous"
      >
        <i class="bi bi-chevron-left"></i>
      </a>
    </li>

    <!-- Номера страниц -->
    <li class="page-item">
      <a class="page-link" href="/search?page={PAGE_NUM}">{PAGE_NUM}</a>
    </li>
    <li class="page-item active">
      <a
        class="page-link"
        href="/search?page={CURRENT_PAGE}"
        aria-current="page"
        >{CURRENT_PAGE}</a
      >
    </li>

    <!-- Следующая страница -->
    <li class="page-item">
      <a class="page-link" href="/search?page={NEXT_PAGE}" aria-label="Next">
        <i class="bi bi-chevron-right"></i>
      </a>
    </li>

    <!-- Последняя страница -->
    <li class="page-item">
      <a class="page-link" href="/search?page={TOTAL_PAGES}" aria-label="Last">
        <i class="bi bi-chevron-bar-right"></i>
      </a>
    </li>
  </ul>
</nav>
```

## Обязательные атрибуты

### Корневой элемент

- `data-component="pagination"` - идентификатор компонента
- `aria-label="Page navigation"` - для доступности

### Активная страница

- `class="page-item active"` - CSS класс для активной страницы
- `aria-current="page"` - атрибут доступности для активной страницы

### Отключенные элементы

- `class="page-item disabled"` - CSS класс для отключенных элементов
- Используйте `<span>` вместо `<a>` для отключенных ссылок

## Состояния пагинации

### На первой странице

```html
<nav
  class="pagination-wrapper"
  aria-label="Page navigation"
  data-component="pagination"
>
  <ul class="pagination">
    <!-- Первая страница (отключена) -->
    <li class="page-item disabled">
      <span class="page-link" aria-label="First">
        <i class="bi bi-chevron-bar-left"></i>
      </span>
    </li>

    <!-- Предыдущая страница (отключена) -->
    <li class="page-item disabled">
      <span class="page-link" aria-label="Previous">
        <i class="bi bi-chevron-left"></i>
      </span>
    </li>

    <!-- Активная первая страница -->
    <li class="page-item active">
      <a class="page-link" href="/search?page=1" aria-current="page">1</a>
    </li>

    <!-- Остальные страницы... -->
  </ul>
</nav>
```

### На последней странице

```html
<nav
  class="pagination-wrapper"
  aria-label="Page navigation"
  data-component="pagination"
>
  <ul class="pagination">
    <!-- Предыдущие страницы... -->

    <!-- Активная последняя страница -->
    <li class="page-item active">
      <a class="page-link" href="/search?page=10" aria-current="page">10</a>
    </li>

    <!-- Следующая страница (отключена) -->
    <li class="page-item disabled">
      <span class="page-link" aria-label="Next">
        <i class="bi bi-chevron-right"></i>
      </span>
    </li>

    <!-- Последняя страница (отключена) -->
    <li class="page-item disabled">
      <span class="page-link" aria-label="Last">
        <i class="bi bi-chevron-bar-right"></i>
      </span>
    </li>
  </ul>
</nav>
```

### С многоточием

```html
<nav
  class="pagination-wrapper"
  aria-label="Page navigation"
  data-component="pagination"
>
  <ul class="pagination">
    <!-- Навигационные кнопки... -->

    <!-- Многоточие в начале -->
    <li class="page-item disabled">
      <span class="page-link ellipsis">...</span>
    </li>

    <!-- Видимые страницы -->
    <li class="page-item">
      <a class="page-link" href="/search?page=4">4</a>
    </li>
    <li class="page-item active">
      <a class="page-link" href="/search?page=5" aria-current="page">5</a>
    </li>
    <li class="page-item">
      <a class="page-link" href="/search?page=6">6</a>
    </li>

    <!-- Многоточие в конце -->
    <li class="page-item disabled">
      <span class="page-link ellipsis">...</span>
    </li>

    <!-- Навигационные кнопки... -->
  </ul>
</nav>
```

### Одна страница (скрыта)

```html
<!-- Если всего 1 страница, пагинация не отображается -->
<nav
  class="pagination-wrapper"
  aria-label="Page navigation"
  data-component="pagination"
  style="display: none;"
>
  <!-- Пустая пагинация -->
</nav>
```

## Логика генерации пагинации (Yii)

```php
<?php
/**
 * Генератор пагинации для Yii Framework
 */

/**
 * Генерирует массив видимых страниц для пагинации
 * @param int $currentPage Текущая страница
 * @param int $totalPages Общее количество страниц
 * @param int $maxVisible Максимальное количество видимых страниц
 * @return array
 */
function generatePaginationPages($currentPage, $totalPages, $maxVisible = 5) {
    if ($totalPages <= $maxVisible) {
        // Показываем все страницы
        return range(1, $totalPages);
    }

    $pages = [];
    $halfVisible = floor($maxVisible / 2);

    if ($currentPage <= $halfVisible + 1) {
        // Начало списка
        $pages = range(1, $maxVisible - 1);
        $pages[] = '...';
    } elseif ($currentPage >= $totalPages - $halfVisible) {
        // Конец списка
        $pages[] = '...';
        $pages = array_merge($pages, range($totalPages - $maxVisible + 2, $totalPages));
    } else {
        // Середина списка
        $pages[] = '...';
        $start = $currentPage - floor(($maxVisible - 3) / 2);
        $end = $currentPage + ceil(($maxVisible - 3) / 2);
        $pages = array_merge($pages, range($start, $end));
        $pages[] = '...';
    }

    return $pages;
}

/**
 * Проверяет, должна ли кнопка быть отключена
 * @param string $type Тип кнопки: 'first', 'prev', 'next', 'last'
 * @param int $currentPage
 * @param int $totalPages
 * @return bool
 */
function isPaginationButtonDisabled($type, $currentPage, $totalPages) {
    switch ($type) {
        case 'first':
        case 'prev':
            return $currentPage <= 1;
        case 'next':
        case 'last':
            return $currentPage >= $totalPages;
        default:
            return false;
    }
}

/**
 * Генерирует URL для страницы
 * @param int $page
 * @param array $params Дополнительные параметры запроса
 * @return string
 */
function generatePageUrl($page, $params = []) {
    $params['page'] = $page;
    return Url::current($params);
}

/**
 * Определяет, нужно ли показывать пагинацию
 * @param int $totalPages
 * @return bool
 */
function shouldShowPagination($totalPages) {
    return $totalPages > 1;
}
?>
```

## Пример Yii View

```php
<?php
use yii\helpers\Html;
use yii\helpers\Url;

/* @var $pagination yii\data\Pagination */
/* @var $params array Параметры запроса */

$currentPage = $pagination->getPage() + 1; // Yii использует 0-based индексацию
$totalPages = $pagination->getPageCount();
$maxVisible = 5;

// Не показываем пагинацию если только одна страница
if (!shouldShowPagination($totalPages)) {
    return;
}

$visiblePages = generatePaginationPages($currentPage, $totalPages, $maxVisible);
?>

<nav class="pagination-wrapper" aria-label="Page navigation" data-component="pagination">
    <ul class="pagination">
        <!-- Первая страница -->
        <li class="page-item <?= isPaginationButtonDisabled('first', $currentPage, $totalPages) ? 'disabled' : '' ?>">
            <?php if (isPaginationButtonDisabled('first', $currentPage, $totalPages)): ?>
                <span class="page-link" aria-label="First">
                    <i class="bi bi-chevron-bar-left"></i>
                </span>
            <?php else: ?>
                <a class="page-link" href="<?= generatePageUrl(1, $params) ?>" aria-label="First">
                    <i class="bi bi-chevron-bar-left"></i>
                </a>
            <?php endif; ?>
        </li>

        <!-- Предыдущая страница -->
        <li class="page-item <?= isPaginationButtonDisabled('prev', $currentPage, $totalPages) ? 'disabled' : '' ?>">
            <?php if (isPaginationButtonDisabled('prev', $currentPage, $totalPages)): ?>
                <span class="page-link" aria-label="Previous">
                    <i class="bi bi-chevron-left"></i>
                </span>
            <?php else: ?>
                <a class="page-link" href="<?= generatePageUrl($currentPage - 1, $params) ?>" aria-label="Previous">
                    <i class="bi bi-chevron-left"></i>
                </a>
            <?php endif; ?>
        </li>

        <!-- Номера страниц -->
        <?php foreach ($visiblePages as $page): ?>
            <?php if ($page === '...'): ?>
                <li class="page-item disabled">
                    <span class="page-link ellipsis">...</span>
                </li>
            <?php else: ?>
                <li class="page-item <?= $page === $currentPage ? 'active' : '' ?>">
                    <a class="page-link"
                       href="<?= generatePageUrl($page, $params) ?>"
                       <?= $page === $currentPage ? 'aria-current="page"' : '' ?>>
                        <?= $page ?>
                    </a>
                </li>
            <?php endif; ?>
        <?php endforeach; ?>

        <!-- Следующая страница -->
        <li class="page-item <?= isPaginationButtonDisabled('next', $currentPage, $totalPages) ? 'disabled' : '' ?>">
            <?php if (isPaginationButtonDisabled('next', $currentPage, $totalPages)): ?>
                <span class="page-link" aria-label="Next">
                    <i class="bi bi-chevron-right"></i>
                </span>
            <?php else: ?>
                <a class="page-link" href="<?= generatePageUrl($currentPage + 1, $params) ?>" aria-label="Next">
                    <i class="bi bi-chevron-right"></i>
                </a>
            <?php endif; ?>
        </li>

        <!-- Последняя страница -->
        <li class="page-item <?= isPaginationButtonDisabled('last', $currentPage, $totalPages) ? 'disabled' : '' ?>">
            <?php if (isPaginationButtonDisabled('last', $currentPage, $totalPages)): ?>
                <span class="page-link" aria-label="Last">
                    <i class="bi bi-chevron-bar-right"></i>
                </span>
            <?php else: ?>
                <a class="page-link" href="<?= generatePageUrl($totalPages, $params) ?>" aria-label="Last">
                    <i class="bi bi-chevron-bar-right"></i>
                </a>
            <?php endif; ?>
        </li>
    </ul>
</nav>
```

## Пример использования с Yii Pagination

```php
<?php
// В контроллере
use yii\data\Pagination;

public function actionSearch() {
    $query = Property::find()->where(['status' => 'active']);

    $pagination = new Pagination([
        'defaultPageSize' => 20,
        'totalCount' => $query->count(),
    ]);

    $properties = $query->offset($pagination->offset)
        ->limit($pagination->limit)
        ->all();

    return $this->render('search', [
        'properties' => $properties,
        'pagination' => $pagination,
        'params' => Yii::$app->request->queryParams
    ]);
}
?>
```

## Bootstrap Icons

Компонент использует Bootstrap Icons. Убедитесь, что они подключены:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
/>
```

Используемые иконки:

- `bi-chevron-bar-left` - первая страница
- `bi-chevron-left` - предыдущая страница
- `bi-chevron-right` - следующая страница
- `bi-chevron-bar-right` - последняя страница

## События JavaScript

JavaScript автоматически отслеживает клики по пагинации и отправляет события:

```javascript
// Слушаем событие изменения страницы
document.addEventListener("pagination-change", function (event) {
  console.log("Переход на страницу:", event.detail.page);
  console.log("URL:", event.detail.href);

  // Можно добавить свою логику, например, аналитику
});
```

## Важные замечания

1. **Обязательные классы**: Используйте точные CSS классы как в примерах
2. **Доступность**: Обязательно включайте `aria-label` и `aria-current`
3. **Отключенные элементы**: Используйте `<span>` вместо `<a>` для отключенных кнопок
4. **URL параметры**: Сохраняйте все параметры поиска при переходе между страницами
5. **SEO**: Используйте правильные URL для индексации поисковиками

## Адаптивность

На мобильных устройствах (ширина < 576px) автоматически скрываются некоторые номера страниц для экономии места.

## Тестирование

1. Проверьте корректность URL для всех ссылок
2. Убедитесь в правильности состояний disabled/active
3. Протестируйте доступность с помощью скринридера
4. Проверьте работу на мобильных устройствах

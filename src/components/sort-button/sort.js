    $(document).ready(function() {
        // Function to get URL parameters
        function getUrlParams() {
            let params = {};
            let queryString = window.location.search.substring(1);
            let pairs = queryString.split('&');
            
            for (let i = 0; i < pairs.length; i++) {
                if (!pairs[i]) continue;
                let pair = pairs[i].split('=');
                let key = decodeURIComponent(pair[0]);
                let value = pair[1] ? decodeURIComponent(pair[1]) : '';
                
                // Handle array parameters (like districts[])
                if (key.includes('[]')) {
                    key = key.replace('[]', '');
                    if (!params[key]) params[key] = [];
                    params[key].push(value);
                } else {
                    params[key] = value;
                }
            }
            return params;
        }
        
        // Function to build sort URL
        function buildSortUrl(sort, direction) {
            let params = getUrlParams();
            let url = new URL(window.location.href);
            let searchParams = new URLSearchParams();
            
            // Preserve existing parameters except sort and direction
            for (let key in params) {
                if (key !== 'sort' && key !== 'direction') {
                    if (Array.isArray(params[key])) {
                        params[key].forEach(value => {
                            searchParams.append(`${key}[]`, value);
                        });
                    } else {
                        searchParams.append(key, params[key]);
                    }
                }
            }
            
            // Add sort parameters
            searchParams.append('sort', sort);
            searchParams.append('direction', direction);
            
            return url.pathname + '?' + searchParams.toString();
        }
        
        // Set active class based on current URL parameters
        function setActiveSort() {
            let params = getUrlParams();
            let currentSort = params.sort;
            let currentDirection = params.direction;
            
            $('.dropdown-item').removeClass('active');
            
            if (currentSort && currentDirection) {
                $(`.dropdown-item[data-sort="${currentSort}"][data-direction="${currentDirection}"]`).addClass('active');
            }
        }
        
        // Handle sort item clicks
        $('.dropdown-item').click(function(e) {
            e.preventDefault();
            let sort = $(this).data('sort');
            let direction = $(this).data('direction');
            
            window.location.href = buildSortUrl(sort, direction);
        });
        
        // Initialize active state
        setActiveSort();
    });
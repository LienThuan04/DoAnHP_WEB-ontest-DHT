<?php

class Pagination extends Controller
{
    public $paginationModel;
    public $queryModel;

    public function __construct($model)
    {
        $this->paginationModel = $this->model("PaginationModel");
        $this->queryModel = $this->model($model);
    }

    public function getData($args)
    {
        $limit = 10;
        $page = 1;
        $input = $input ?? null;
        $filter = $filter ?? null;
        extract($args);
        $offset = ($page - 1) * $limit;
        $query = $this->queryModel->getQuery($filter, $input, $args);
        $result = $this->paginationModel->pagination($query, $limit, $offset);
        echo json_encode($result);
    }

    public function getTotal($args)
    {
        $limit = 10;
        // support both 'input' and legacy 'content' keys coming from different pages
        $input = $args['input'] ?? ($args['content'] ?? null);
        $filter = $args['filter'] ?? null;
        $func = $args['custom']['function'] ?? null;

        // Bắt buộc thêm cờ đếm để getQueryAll bỏ ORDER BY
        $args['count_only'] = true;
        $queryResult = $this->queryModel->getQuery($filter, $input, $args);

        // Lấy truy vấn gốc và tham số
        $originalQuery = is_array($queryResult) ? $queryResult['query'] : $queryResult;
        $params = $queryResult['params'] ?? [];

        if ($func === 'getUserTestSchedule') {
            $cleanedQuery = preg_replace('/ORDER BY\s+[\w`.\s,]+(\s+(ASC|DESC))?/i', '', $originalQuery);
            $cleanedQuery = preg_replace('/LIMIT\s+\d+(\s*,\s*\d+)?/i', '', $cleanedQuery);

            $count_query = "SELECT COUNT(*) AS total FROM ( $cleanedQuery ) AS sub";
        } else {
            // Loại bỏ ORDER BY và LIMIT nếu có
            // Use a more robust pattern to remove the entire ORDER BY clause even when it
            // contains functions, parentheses or complex expressions (e.g. CAST(...)).
            $cleanedQuery = preg_replace('/ORDER\s+BY[\s\S]*?(?=(LIMIT|$))/i', '', $originalQuery);
            $cleanedQuery = preg_replace('/LIMIT\s+\d+(\s*,\s*\d+)?/i', '', $cleanedQuery);

            // Đếm tổng kết quả qua subquery nếu chứa GROUP BY, UNION hoặc DISTINCT
            $hasUnion = stripos($cleanedQuery, 'UNION') !== false;
            $hasGroupBy = stripos($cleanedQuery, 'GROUP BY') !== false;
            $hasDistinct = stripos($cleanedQuery, 'DISTINCT') !== false;

            if ($hasGroupBy || $hasUnion || $hasDistinct) {
                $count_query = "SELECT COUNT(*) AS total FROM ( $cleanedQuery ) AS counted_results";
            } else {
                // Trường hợp đơn giản: thay SELECT ban đầu bằng COUNT(*)
                $count_query = preg_replace('/^SELECT\s.+?\sFROM/i', 'SELECT COUNT(*) AS total FROM', $cleanedQuery);
            }
        }

        // Gửi truy vấn và tham số về hàm phân trang
        $queryData = [
            'query' => $originalQuery,
            'params' => $params,
            'count_query' => $count_query
        ];

        $result = $this->paginationModel->getTotalPages($queryData, $limit, $args);
        echo $result;
    }

}

<?php
// Routes

$app->get('/[{name}]', function ($request, $response, $args) {
    // Sample log message
    $this->logger->info("Slim-Result '/' route");

    // Render index view
    if(isset($args["name"])) {
        return 'Not Found';
    } else {
        return $this->renderer->render($response, 'index.phtml', []);
    }
});

$app->post('/[{action}]', function ($request, $response, $args) {
    $data = $request->getParsedBody();
    $menstrData = [];
    $menstrData['avg-menstr'] = filter_var($data['avg-menstr'], FILTER_SANITIZE_STRING);
    $menstrData['start-menstr-date'] = filter_var($data['start-menstr-date'], FILTER_SANITIZE_STRING);
    $date = $menstrData['start-menstr-date'];
    $states = [
        'danger' => [],
        'menstr' => [],
        'safe' => [],
    ];
    $daySec = 86400;
    $startTime = strtotime($menstrData['start-menstr-date']);
    $date = date_parse($date);
    if (checkdate($date['month'], $date['day'], $date['year'])) {
        $times = 1;
        while ($times <= 2) {
            for ($index=1;$index<=5;$index++) {
                $states['menstr'][] = date('m-d-Y', $startTime);
                $startTime += $daySec;
            }
            $theCount = $menstrData['avg-menstr'] - 24;
            if ($theCount !== 0) {
                for ($index=1;$index<=$theCount;$index++) {
                    $states['safe'][] = date('m-d-Y', $startTime);
                    $startTime += $daySec;
                }
            }
            for ($index=1;$index<=10;$index++) {
                $states['danger'][] = date('m-d-Y', $startTime);
                $startTime += $daySec;
            }
            for ($index=1;$index<=9;$index++) {
                $states['safe'][] = date('m-d-Y', $startTime);
                $startTime += $daySec;
            }
            $times += 1;
        }

        return $this->renderer->render($response, 'index.phtml', [
            'eventList' => $states
        ]);
    } else {
        return 'Invalid date';
    }
});

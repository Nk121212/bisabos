<?php
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    
    // echo "Skrip PHP berjalan.";
    // exit;

    require_once __DIR__ . '/../vendor/autoload.php';

    if (isset($_POST['htmlContent'])) {

        $htmlContent = $_POST['htmlContent'];
    
        // try {
            $mpdf = new \Mpdf\Mpdf([
                'format' => 'A4',
                'orientation' => 'P',
            ]);

            
            $mpdf->WriteHTML($htmlContent);
            
            $pdfOutput = $mpdf->Output('', 'S'); // Get PDF as string
            echo $pdfOutput;
            exit;
    
            // header('Content-Type: application/pdf');
            // header('Content-Disposition: attachment; filename="debug.pdf"');
            // echo $pdfOutput;
            // exit;
    
        // } catch (\Mpdf\MpdfException $e) {
        //     header('HTTP/1.1 500 Internal Server Error');
        //     echo 'Terjadi kesalahan saat membuat PDF: ' . $e->getMessage();
        // }
    } else {
        echo 'hmm';exit;
        header('HTTP/1.1 400 Bad Request');
        echo 'Tidak ada konten HTML yang diterima.';
    }
?>
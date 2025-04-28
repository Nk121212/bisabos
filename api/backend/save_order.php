<?php
    header('Content-Type: application/json');

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $inputJSON = file_get_contents('php://input');
        $newData = json_decode($inputJSON, true);

        if ($newData && isset($newData['ktp'])) {
            $filename = '../json/data_order.json';
            $existingData = [];
            $isReplaced = false;

            // Cek apakah file sudah ada dan baca isinya
            if (file_exists($filename)) {
                $fileContent = file_get_contents($filename);
                $existingData = json_decode($fileContent, true);
                if (!is_array($existingData)) {
                    $existingData = []; // Inisialisasi jika decoding gagal
                }

                // Cari apakah KTP sudah ada dan replace jika ditemukan
                foreach ($existingData as $key => $item) {
                    if (isset($item['ktp']) && $item['ktp'] == $newData['ktp']) {
                        $existingData[$key] = $newData;
                        $isReplaced = true;
                        break; // Keluar dari loop setelah menemukan dan mengganti
                    }
                }
            }

            // Jika KTP belum ada, tambahkan data baru
            if (!$isReplaced) {
                $existingData[] = $newData;
            }

            // Simpan kembali ke file JSON
            if (file_put_contents($filename, json_encode($existingData, JSON_PRETTY_PRINT))) {
                echo json_encode(['status' => 'success', 'message' => $isReplaced ? 'Data order berhasil diperbarui.' : 'Data order berhasil disimpan.']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Gagal menulis data ke file.']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Data JSON tidak valid atau KTP tidak ditemukan.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Metode request tidak diizinkan.']);
    }
?>
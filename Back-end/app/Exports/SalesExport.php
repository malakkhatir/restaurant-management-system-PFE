<?php

namespace App\Exports;

use App\Models\Sales;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Events\AfterSheet;

class SalesExport implements 
    FromCollection, 
    WithHeadings, 
    WithColumnFormatting, 
    WithStyles, 
    WithEvents
{
    protected $from;
    protected $to;

    public function __construct($from, $to)
    {
        $this->from = $from;
        $this->to = $to;
    }

    public function collection()
    {
        return Sales::with(['table', 'servant'])
            ->whereBetween('created_at', [$this->from, $this->to])
            ->where('payment_status', 'paye')
            ->get()
            ->map(function ($sale) {
                return [
                    $sale->id,
                    $sale->created_at,
                    $sale->total_price,
                    $sale->table ? $sale->table->name : 'N/A',
                    $sale->servant ? $sale->servant->name : 'N/A',
                ];
            });
    }

    public function headings(): array
    {
        return [
            ['Rapport des Ventes'], // Main title
            ['ID', 'Date', 'Prix Total (DH)', 'Table', 'Serveur'] // Column headers with localization
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 18, 'color' => ['rgb' => 'FFFFFF']], 
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '87CEEB']], // Green header background
                'alignment' => ['horizontal' => 'center', 'vertical' => 'center']
            ],
            2 => [
                'font' => ['bold' => true, 'color' => ['rgb' => '000000']], 
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'ADD8E6']], // Yellow column header background
                'alignment' => ['horizontal' => 'center']
            ]
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                // Merge and center the title
                $event->sheet->mergeCells('A1:E1');
                $event->sheet->getStyle('A1')->getAlignment()->setHorizontal('center');
                $event->sheet->getStyle('A1')->getAlignment()->setVertical('center');

                // Adjust column widths automatically
                foreach (range('A', 'E') as $col) {
                    $event->sheet->getDelegate()->getColumnDimension($col)->setAutoSize(true);
                }

                // Set row height for the title
                $event->sheet->getDelegate()->getRowDimension(1)->setRowHeight(50);

                // Set page orientation
                $event->sheet->getPageSetup()->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE);
            }
        ];
    }

    public function columnFormats(): array
    {
        return [
            'A' => '0',
            'B' => 'yyyy-mm-dd hh:mm:ss',
            'C' => '0.00', // Currency formatting for the total price
        ];
    }
}

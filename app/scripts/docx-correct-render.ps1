param([string]$Directory=(Join-Path $PSScriptRoot '../docs/review-20261029/render'))
$ErrorActionPreference='Stop'
$Directory=[IO.Path]::GetFullPath($Directory)
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class ReviewPdf {
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode)] public static extern bool SetDllDirectory(string path);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern void FPDF_InitLibrary();
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern IntPtr FPDF_LoadDocument(byte[] path,IntPtr password);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern int FPDF_GetPageCount(IntPtr doc);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern IntPtr FPDF_LoadPage(IntPtr doc,int index);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern double FPDF_GetPageWidth(IntPtr page);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern double FPDF_GetPageHeight(IntPtr page);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern IntPtr FPDFBitmap_Create(int width,int height,int alpha);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern void FPDFBitmap_FillRect(IntPtr bitmap,int left,int top,int width,int height,uint color);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern void FPDF_RenderPageBitmap(IntPtr bitmap,IntPtr page,int x,int y,int width,int height,int rotate,int flags);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern IntPtr FPDFBitmap_GetBuffer(IntPtr bitmap);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern int FPDFBitmap_GetStride(IntPtr bitmap);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern void FPDFBitmap_Destroy(IntPtr bitmap);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern void FPDF_ClosePage(IntPtr page);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern void FPDF_CloseDocument(IntPtr doc);
}
'@
[void][ReviewPdf]::SetDllDirectory('C:/Program Files/LibreOffice/program')
[ReviewPdf]::FPDF_InitLibrary()
$pdf=Join-Path $Directory 'Tuan6_WarehouseTeam_ChiDacTaUC_SuaDungMau.pdf'
$doc=[ReviewPdf]::FPDF_LoadDocument([Text.Encoding]::UTF8.GetBytes($pdf+[char]0),[IntPtr]::Zero)
if($doc -eq [IntPtr]::Zero){throw 'PDF did not load.'}
$count=[ReviewPdf]::FPDF_GetPageCount($doc)
try {
 $pages=([IO.File]::ReadAllText((Join-Path $Directory 'noi-dung-hien-thi.txt')) -split [char]12)
 $samples=[Collections.Generic.HashSet[int]]::new();[void]$samples.Add(0)
 for($i=0;$i -lt $pages.Count;$i++){if($pages[$i] -match 'UC-13 Lập|UC-31 Phê|UC-35 Báo|UC-28 Lập|UC-BS01 Quản|UC-23 Yêu'){[void]$samples.Add($i)}}
 $font=[Drawing.Font]::new('Arial',12)
 for($start=0;$start -lt $count;$start+=12){
  $sheet=[Drawing.Bitmap]::new(4*306,3*420);$g=[Drawing.Graphics]::FromImage($sheet);$g.Clear([Drawing.Color]::LightGray)
  for($i=$start;$i -lt [Math]::Min($start+12,$count);$i++){
   $page=[ReviewPdf]::FPDF_LoadPage($doc,$i);$w=[int][ReviewPdf]::FPDF_GetPageWidth($page);$h=[int][ReviewPdf]::FPDF_GetPageHeight($page)
   $bmp=[ReviewPdf]::FPDFBitmap_Create($w,$h,0);[ReviewPdf]::FPDFBitmap_FillRect($bmp,0,0,$w,$h,4294967295)
   [ReviewPdf]::FPDF_RenderPageBitmap($bmp,$page,0,0,$w,$h,0,0)
   $image=[Drawing.Bitmap]::new($w,$h,[ReviewPdf]::FPDFBitmap_GetStride($bmp),[Drawing.Imaging.PixelFormat]::Format32bppRgb,[ReviewPdf]::FPDFBitmap_GetBuffer($bmp))
   if($samples.Contains($i)){$image.Save((Join-Path $Directory ('page-'+($i+1)+'.png')),[Drawing.Imaging.ImageFormat]::Png)}
   $x=(($i-$start)%4)*306;$y=[int][Math]::Floor(($i-$start)/4)*420
   $g.DrawImage($image,$x,$y,306,396);$g.DrawString(('Page '+($i+1)),$font,[Drawing.Brushes]::Black,$x,$y+397)
   $image.Dispose();[ReviewPdf]::FPDFBitmap_Destroy($bmp);[ReviewPdf]::FPDF_ClosePage($page)
  }
  $sheet.Save((Join-Path $Directory ('sheet-'+(1+[int]($start/12))+'.png')),[Drawing.Imaging.ImageFormat]::Png);$g.Dispose();$sheet.Dispose()
 }
 $font.Dispose();Write-Output ('Rendered '+$count+' pages; sample pages '+(($samples|Sort-Object|ForEach-Object{$_+1}) -join ', '))
} finally {[ReviewPdf]::FPDF_CloseDocument($doc)}

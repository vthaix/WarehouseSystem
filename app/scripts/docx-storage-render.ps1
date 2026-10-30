$ErrorActionPreference='Stop'
$base=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../docs/review-20261030/render'))
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class StoragePdf {
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode)] public static extern bool SetDllDirectory(string path);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern void FPDF_InitLibrary();
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern IntPtr FPDF_LoadDocument(byte[] path,IntPtr password);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern int FPDF_GetPageCount(IntPtr doc);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern IntPtr FPDF_LoadPage(IntPtr doc,int index);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern double FPDF_GetPageWidth(IntPtr page);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern double FPDF_GetPageHeight(IntPtr page);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern IntPtr FPDFText_LoadPage(IntPtr page);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern int FPDFText_CountChars(IntPtr text);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll",CharSet=CharSet.Unicode)] public static extern int FPDFText_GetText(IntPtr text,int start,int count,StringBuilder result);
 [DllImport("C:/Program Files/LibreOffice/program/pdfiumlo.dll")] public static extern void FPDFText_ClosePage(IntPtr text);
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
[void][StoragePdf]::SetDllDirectory('C:/Program Files/LibreOffice/program');[StoragePdf]::FPDF_InitLibrary()
$pdf=(Get-ChildItem -LiteralPath $base -Filter '*.pdf'|Select-Object -First 1).FullName
$doc=[StoragePdf]::FPDF_LoadDocument([Text.Encoding]::UTF8.GetBytes($pdf+[char]0),[IntPtr]::Zero)
if($doc-eq [IntPtr]::Zero){throw 'PDF did not load'}
$samples=[Collections.Generic.List[object]]::new();$texts=[Collections.Generic.List[string]]::new()
try{$count=[StoragePdf]::FPDF_GetPageCount($doc)
 for($i=0;$i-lt $count;$i++){
  $page=[StoragePdf]::FPDF_LoadPage($doc,$i);$tp=[StoragePdf]::FPDFText_LoadPage($page);$chars=[StoragePdf]::FPDFText_CountChars($tp);$sb=[Text.StringBuilder]::new($chars+1);[void][StoragePdf]::FPDFText_GetText($tp,0,$chars,$sb);$text=$sb.ToString();$texts.Add($text);[StoragePdf]::FPDFText_ClosePage($tp)
  if((($text-match 'UC-08 |UC-09 |UC-22 ')-and ($text-match 'Actor|Alternative flow|Basic flow'))-or ($i -in @(121,122,136,137,138))){
   $w=[int]([StoragePdf]::FPDF_GetPageWidth($page)*1.5);$h=[int]([StoragePdf]::FPDF_GetPageHeight($page)*1.5);$bmp=[StoragePdf]::FPDFBitmap_Create($w,$h,0);[StoragePdf]::FPDFBitmap_FillRect($bmp,0,0,$w,$h,4294967295);[StoragePdf]::FPDF_RenderPageBitmap($bmp,$page,0,0,$w,$h,0,0)
   $image=[Drawing.Bitmap]::new($w,$h,[StoragePdf]::FPDFBitmap_GetStride($bmp),[Drawing.Imaging.PixelFormat]::Format32bppRgb,[StoragePdf]::FPDFBitmap_GetBuffer($bmp));$file='page-'+($i+1)+'.png';$image.Save((Join-Path $base $file),[Drawing.Imaging.ImageFormat]::Png);$image.Dispose();[StoragePdf]::FPDFBitmap_Destroy($bmp);$samples.Add(@{page=$i+1;image=$file})
  }
  [StoragePdf]::FPDF_ClosePage($page)
 }
 [IO.File]::WriteAllText((Join-Path $base 'NOI_DUNG_PDF.txt'),($texts-join [char]12),[Text.UTF8Encoding]::new($false));@{pdfPages=$count;samples=$samples}|ConvertTo-Json -Depth 5|Set-Content (Join-Path $base 'RENDER_CHECK.json') -Encoding UTF8
 Write-Output ('PDF readable: '+$count+' pages; '+$samples.Count+' sampled specification pages.')
}finally{[StoragePdf]::FPDF_CloseDocument($doc)}

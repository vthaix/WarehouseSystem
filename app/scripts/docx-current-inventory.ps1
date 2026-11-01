param([string]$Directory=(Join-Path $PSScriptRoot '../docs/review-20261101'))
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$Directory=[IO.Path]::GetFullPath($Directory);[void][IO.Directory]::CreateDirectory($Directory)
$source=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../docs/review-20261030/Tuan6_DacTaUC_KemSequence_CapNhatKho_20261030.docx'))
$zip=[IO.Compression.ZipFile]::OpenRead($source)
try{
 $reader=[IO.StreamReader]::new($zip.GetEntry('word/document.xml').Open());$d=[Xml.XmlDocument]::new();$d.PreserveWhitespace=$true;$d.LoadXml($reader.ReadToEnd());$reader.Dispose()
 $ns=[Xml.XmlNamespaceManager]::new($d.NameTable);$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main');$ns.AddNamespace('a','http://schemas.openxmlformats.org/drawingml/2006/main');$ns.AddNamespace('r','http://schemas.openxmlformats.org/officeDocument/2006/relationships')
 $tables=@($d.SelectNodes('//w:body/w:tbl',$ns));$records=@();$text=[Collections.Generic.List[string]]::new()
 for($i=0;$i-lt $tables.Count;$i++){$rows=@($tables[$i].SelectNodes('w:tr',$ns));$cells=@();for($j=0;$j-lt $rows.Count;$j++){$cols=@($rows[$j].SelectNodes('w:tc',$ns));for($k=0;$k-lt $cols.Count;$k++){$ps=@($cols[$k].SelectNodes('.//w:p',$ns));for($p=0;$p-lt $ps.Count;$p++){$t=($ps[$p].SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText}) -join '';$cells+=@{row=$j;col=$k;paragraph=$p;text=$t};$text.Add("[$i,$j,$k,$p] $t")}}};$records+=@{table=$i;cells=$cells}}
 $records|ConvertTo-Json -Depth 10|Set-Content -LiteralPath (Join-Path $Directory 'current-tables.json') -Encoding UTF8
 $text|Set-Content -LiteralPath (Join-Path $Directory 'current-text.txt') -Encoding UTF8
 $seq=@();foreach($p in $d.SelectNodes('//w:body/w:p',$ns)){$t=($p.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText})-join '';if($t-match 'Sequence|UC-|sequence'){$seq+=@{text=$t;images=@($p.SelectNodes('.//a:blip',$ns)|ForEach-Object{$_.GetAttribute('embed','http://schemas.openxmlformats.org/officeDocument/2006/relationships')})}}}
 $seq|ConvertTo-Json -Depth 6|Set-Content -LiteralPath (Join-Path $Directory 'sequence-inventory.json') -Encoding UTF8
 Write-Output ('Inventoried '+$tables.Count+' tables; '+$zip.Entries.Count+' package parts; '+$source)
}finally{$zip.Dispose()}

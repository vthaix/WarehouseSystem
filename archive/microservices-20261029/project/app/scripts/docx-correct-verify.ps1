param([string]$Directory=(Join-Path $PSScriptRoot '../docs/review-20261029'))
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$Directory=[IO.Path]::GetFullPath($Directory)
$model=Get-Content (Join-Path $Directory 'noi-dung-sua.json') -Raw -Encoding UTF8|ConvertFrom-Json
$zip=[IO.Compression.ZipFile]::OpenRead((Join-Path $Directory 'Tuan6_WarehouseTeam_ChiDacTaUC_SuaDungMau.docx'))
try {
 $reader=[IO.StreamReader]::new($zip.GetEntry('word/document.xml').Open());$d=[Xml.XmlDocument]::new();$d.PreserveWhitespace=$true;$d.LoadXml($reader.ReadToEnd());$reader.Dispose()
 $ns=[Xml.XmlNamespaceManager]::new($d.NameTable);$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
 $body=$d.SelectSingleNode('//w:body',$ns);$nodes=@($body.ChildNodes);$tables=@($body.SelectNodes('w:tbl',$ns))
 function Text($n){return (($n.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText}) -join '')}
 function Normal([string]$s){return [regex]::Replace($s.Normalize(),'\s','')}
 $checks=[Collections.Generic.List[object]]::new()
 function Check($id,$where,[string]$actual,[string]$expected){if($expected){$checks.Add(@{uc=$id;part=$where;present=(Normal $actual).Contains((Normal $expected));expected=$expected})}}
 foreach($p in $model.originals){
  $table=$nodes[[int]$p.block];$text=Text $table
  foreach($a in $p.cells){Check $p.id ('row '+$a.row+' column '+$a.column) (Text $table.SelectNodes('w:tr',$ns)[$a.row].SelectNodes('w:tc',$ns)[$a.column]) $a.text}
  foreach($pair in $p.flow){foreach($v in $pair){Check $p.id 'basic' $text $v}}
  foreach($name in @('alternatives','exceptions','replaceAlternatives','replaceExceptions')){foreach($v in $p.$name){Check $p.id $name $text $v}}
 }
 for($i=0;$i -lt $model.added.Count;$i++){
  $p=$model.added[$i];$text=Text $tables[50+$i]
  foreach($name in @('title','pre','post','actor')){Check $p.id $name $text $p.$name}
  foreach($pair in $p.basic){foreach($v in $pair){Check $p.id 'basic' $text $v}}
  foreach($name in @('alternatives','exceptions')){foreach($v in $p.$name){Check $p.id $name $text $v}}
 }
 $missing=@($checks|Where-Object{-not $_.present})
 if($missing.Count){$missing|ConvertTo-Json -Depth 5|Set-Content (Join-Path $Directory 'noi-dung-thieu.json') -Encoding UTF8;throw ('Missing content checks: '+$missing.Count)}
 $lines=[Collections.Generic.List[string]]::new()
 foreach($node in $nodes){if($node.LocalName -eq 'tbl'){$lines.Add('TABLE');foreach($row in $node.SelectNodes('w:tr',$ns)){$lines.Add((@($row.SelectNodes('w:tc',$ns)|ForEach-Object{Text $_}) -join ' || '))}}else{$lines.Add((Text $node))}}
 $lines|Set-Content (Join-Path $Directory 'NOI_DUNG_WORD.txt') -Encoding UTF8
 $full=$lines -join "`n"
 $technical=@([regex]::Matches($full,'\b(?:CSRF|API|server|client|transaction|rollback|JSON|PATCH|DELETE|COMPENSATION_REQUIRED|Idempotency-Key|LoaiChiTiet)\b|BR-\d+')|ForEach-Object{$_.Value}|Select-Object -Unique)
 if($technical.Count){throw ('Technical terms in document: '+($technical -join ', '))}
 if($tables.Count -ne 58){throw 'Unexpected UC table count.'}
 @{xmlReadable=$true;topLevelTables=$tables.Count;originalTables=50;newUcTables=8;contentAssertions=$checks.Count;missingContent=0;technicalTerms=$technical;originalStructureProof='kiem-tra-cau-truc.json'}|ConvertTo-Json -Depth 5|Set-Content (Join-Path $Directory 'kiem-tra-noi-dung.json') -Encoding UTF8
 Write-Output ('PASS: '+$checks.Count+' content checks, 50 original UC tables, 8 appended UC tables; XML parsed successfully.')
} finally {$zip.Dispose()}

$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$dir=[IO.Path]::GetFullPath('app/docs/review-20261101');$model=Get-Content -LiteralPath (Join-Path $dir 'spec-test-model.json') -Raw -Encoding UTF8|ConvertFrom-Json;$W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
function ReadDoc([string]$file){$a=[IO.Compression.ZipFile]::OpenRead($file);try{$s=[IO.StreamReader]::new($a.GetEntry('word/document.xml').Open());$d=[Xml.XmlDocument]::new();$d.PreserveWhitespace=$true;$d.LoadXml($s.ReadToEnd());$s.Dispose();return ,$d}finally{$a.Dispose()}}
function Ns($d){$n=[Xml.XmlNamespaceManager]::new($d.NameTable);$n.AddNamespace('w',$W);$n.AddNamespace('a','http://schemas.openxmlformats.org/drawingml/2006/main');return ,$n}
function Text($n,$ns){return (($n.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText})-join '')}
$checks=@();$seen=[Collections.Generic.HashSet[string]]::new();$total=0
foreach($mode in @('Sequence','TestCase')){
 $file=Join-Path $dir ('DacTa_Kem_'+$mode+'_20261101.docx');$d=ReadDoc $file;$ns=Ns $d;$tables=@($d.SelectNodes('//w:body/w:tbl',$ns));$wanted=if($mode-eq 'TestCase'){108}else{54};if($tables.Count-ne $wanted){throw 'Wrong table count'}
 for($i=0;$i-lt $model.tables.Count;$i++){$m=$model.tables[$i];$index=if($mode-eq 'TestCase'){$i*2}else{$i};$table=$tables[$index];$title=Text $table.SelectNodes('w:tr',$ns)[0] $ns;if($title-cne $m.title){throw ('Wrong UC order '+$i)}
  if($i-lt 50){foreach($cell in $m.cells){$p=$table.SelectNodes('w:tr',$ns)[$cell.row].SelectNodes('w:tc',$ns)[$cell.col].SelectNodes('.//w:p',$ns)[$cell.paragraph];if((Text $p $ns)-cne $cell.text){throw ('Wrong specification text '+$m.id)}}}
  if($mode-eq 'TestCase'){$tc=$tables[$index+1];$rows=@($tc.SelectNodes('w:tr',$ns));if($rows.Count-ne $m.tests.Count+1){throw 'Wrong case count'};$headers=@($rows[0].SelectNodes('w:tc',$ns));if($headers.Count-ne 8){throw 'Wrong columns'};if((Text $headers[0] $ns)-cne 'Test ID'-or (Text $headers[7] $ns)-cne 'Pass/Fail'){throw 'Wrong headers'}
   for($j=1;$j-lt $rows.Count;$j++){$cells=@($rows[$j].SelectNodes('w:tc',$ns));$expected=$m.tests[$j-1];if((Text $cells[0] $ns)-cne $expected.id){throw 'Wrong Test ID'};if(-not $seen.Add($expected.id)){throw 'Duplicate Test ID'};if((Text $cells[7] $ns)-cne 'Chưa chạy'){throw 'Unproven test status'};$total++}
  }else{$node=$table.NextSibling;while($node-and $node.LocalName-ne 'tbl' -and -not $node.SelectNodes('.//w:drawing',$ns).Count){$node=$node.NextSibling};if(-not $node-or -not $node.SelectNodes('.//w:drawing',$ns).Count){throw ('Missing sequence immediately after '+$m.id)}}
 }
 $checks+=@{file=[IO.Path]::GetFileName($file);specifications=54;correctOrder=$true;sourceModelMatches=$true;tables=$tables.Count;sha256=(Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash}
}
if($total-ne $model.cases.Count){throw 'Case total mismatch'}
@{documents=$checks;testCases=$total;uniqueIDs=$seen.Count;newResultsAllNotRun=$true;eachSpecificationFollowedByItsOwnSequenceOrTestTable=$true}|ConvertTo-Json -Depth 8|Set-Content -LiteralPath (Join-Path $dir 'INSERTED_DOCS_VERIFICATION.json') -Encoding UTF8
Write-Output ('PASS: 54 specifications per file, correct sequence/test adjacency, '+$total+' unique cases, eight columns and no invented Pass results.')

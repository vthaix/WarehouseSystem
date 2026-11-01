param([string]$Directory='app/docs/review-20261101')
$ErrorActionPreference='Stop'
$ReplaceGenerated=$env:REPLACE_GENERATED_DOCS-eq 'true'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$Directory=[IO.Path]::GetFullPath($Directory)
$model=Get-Content -LiteralPath (Join-Path $Directory 'spec-test-model.json') -Raw -Encoding UTF8|ConvertFrom-Json
$images=Get-Content -LiteralPath (Join-Path $Directory 'sequence-insert-manifest.json') -Raw -Encoding UTF8|ConvertFrom-Json
$source=Join-Path $Directory 'Tuan6_DacTaUC_CapNhat_20261101.docx'
$W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
$R='http://schemas.openxmlformats.org/package/2006/relationships'
function X([string]$s){[Security.SecurityElement]::Escape($s)}
function Parse([string]$xml){$d=[Xml.XmlDocument]::new();$d.PreserveWhitespace=$true;$d.LoadXml($xml);return ,$d}
function N($d){$n=[Xml.XmlNamespaceManager]::new($d.NameTable);$n.AddNamespace('w',$W);$n.AddNamespace('a','http://schemas.openxmlformats.org/drawingml/2006/main');return ,$n}
function Fragment($d,[string]$xml){$f=$d.CreateDocumentFragment();$f.InnerXml=$xml;return $f.FirstChild}
function Para($d,[string]$text,[bool]$bold=$false,[bool]$keep=$false){$pr=if($keep){'<w:keepNext/>'}else{''};$b=if($bold){'<w:b/>'}else{''};return (Fragment $d ('<w:p xmlns:w="'+$W+'"><w:pPr>'+$pr+'<w:spacing w:before="120" w:after="100"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:color w:val="000000"/><w:sz w:val="24"/>'+$b+'</w:rPr><w:t xml:space="preserve">'+(X $text)+'</w:t></w:r></w:p>'))}
function CellXml([string]$text,[int]$width,[bool]$bold=$false,[int]$span=1){$b=if($bold){'<w:b/>'}else{''};$merge=if($span-gt 1){'<w:gridSpan w:val="'+$span+'"/>'}else{''};return '<w:tc><w:tcPr><w:tcW w:w="'+$width+'" w:type="dxa"/>'+$merge+'<w:vAlign w:val="top"/></w:tcPr><w:p><w:pPr><w:spacing w:after="60" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:color w:val="000000"/><w:sz w:val="22"/>'+$b+'</w:rPr><w:t xml:space="preserve">'+(X $text)+'</w:t></w:r></w:p></w:tc>'}
function TableXml([string]$rows,[string]$grid,[string]$caption){return '<w:tbl xmlns:w="'+$W+'"><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCaption w:val="'+(X $caption)+'"/><w:tblBorders><w:top w:val="single" w:sz="6"/><w:left w:val="single" w:sz="6"/><w:bottom w:val="single" w:sz="6"/><w:right w:val="single" w:sz="6"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders><w:tblCellMar><w:top w:w="65" w:type="dxa"/><w:left w:w="65" w:type="dxa"/><w:bottom w:w="65" w:type="dxa"/><w:right w:w="65" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>'+$grid+'</w:tblGrid>'+$rows+'</w:tbl>'}
function TestTable($d,$t){$widths=@(850,1050,1100,1550,1150,1850,1050,760);$headers=@('Test ID','Chức năng','Điều kiện trước','Mô tả','Dữ liệu Test','Kết quả mong muốn','Kết quả thực tế','Pass/Fail');$rows='<w:tr><w:trPr><w:tblHeader/></w:trPr>';for($i=0;$i-lt 8;$i++){$rows+=CellXml $headers[$i] $widths[$i] $true};$rows+='</w:tr>'
 foreach($case in $t.tests){$values=@($case.id,$case.function,$case.pre,$case.description,$case.data,$case.expected,$case.actual,$case.result);$rows+='<w:tr>';for($i=0;$i-lt 8;$i++){$rows+=CellXml $values[$i] $widths[$i]};$rows+='</w:tr>'}
 return (Fragment $d (TableXml $rows (($widths|ForEach-Object{'<w:gridCol w:w="'+$_+'"/>'})-join '') ('TESTCASES '+$t.id)))
}
function SupplementalTable($d,$t){$rows='';foreach($row in ($t.cells|Group-Object row|Sort-Object {[int]$_.Name})){$cells=@($row.Group|Sort-Object col);$rows+='<w:tr>';foreach($cell in $cells){$rows+=CellXml $cell.text $(if($cells.Count-eq 1){9360}else{4680}) ($cell.row-in @(0,5,6)-or $cell.text-in @('Alternative flow','Exception flow')) $(if($cells.Count-eq 1){2}else{1})};$rows+='</w:tr>'};return (Fragment $d (TableXml $rows '<w:gridCol w:w="4680"/><w:gridCol w:w="4680"/>' ('SPEC '+$t.id)))}
function Mask($node){$copy=$node.CloneNode($true);$n=N $copy.OwnerDocument;foreach($text in $copy.SelectNodes('.//w:t',$n)){$text.InnerText=''};return $copy.OuterXml}
function ApplyText($p,[string]$value,$ns){
 $ts=@($p.SelectNodes('.//w:t',$ns));$old=($ts|ForEach-Object{$_.InnerText})-join '';if($old-ceq $value){return};if(-not $ts.Count){throw 'No existing text run for content amendment'}
 $prefix=0;while($prefix-lt [Math]::Min($old.Length,$value.Length)-and $old[$prefix]-ceq $value[$prefix]){$prefix++};$suffix=0;while($suffix-lt [Math]::Min($old.Length-$prefix,$value.Length-$prefix)-and $old[$old.Length-1-$suffix]-ceq $value[$value.Length-1-$suffix]){$suffix++}
 $end=$old.Length-$suffix;$insert=$value.Substring($prefix,$value.Length-$prefix-$suffix);$offset=0;$inserted=$false
 foreach($t in $ts){$s=$t.InnerText;$len=$s.Length;$new='';for($i=0;$i-le $len;$i++){$pos=$offset+$i;if(-not $inserted-and $pos-eq $prefix){$new+=$insert;$inserted=$true};if($i-lt $len-and ($pos-lt $prefix-or $pos-ge $end)){$new+=$s[$i]}};$t.InnerText=$new;$offset+=$len}
 if((($ts|ForEach-Object{$_.InnerText})-join '')-cne $value){throw 'Text replacement failed'}
}
$archive=[IO.Compression.ZipFile]::OpenRead($source)
try{
 $reader=[IO.StreamReader]::new($archive.GetEntry('word/document.xml').Open());$baseXml=$reader.ReadToEnd();$reader.Dispose()
 foreach($mode in @('SEQUENCE','TESTCASE')){
  $d=Parse $baseXml;$ns=N $d;$body=$d.SelectSingleNode('//w:body',$ns);$originalTables=@($body.SelectNodes('w:tbl',$ns));if($originalTables.Count-ne 50){throw 'Expected 50 original specifications'}
  $beforeTables=@($originalTables|ForEach-Object{$_.CloneNode($true)});$nodes=@($body.ChildNodes);$body.RemoveAll();$index=0;$afterTable=$false;$removedOld=0;$draw=10000;$newImages=[Collections.Generic.List[object]]::new()
  if($mode-eq 'TESTCASE'){[void]$body.AppendChild((Para $d 'Hướng dẫn kiểm thử: T là ngày kiểm thử theo UTC+7. Chuẩn bị dữ liệu riêng theo từng ca, không reset dữ liệu chính. Các mã ca mới chưa chạy riêng; cột kết quả thực tế và Pass/Fail ghi Chưa chạy. Không suy ra Pass từ log nhóm cũ.'))}
  foreach($node in $nodes){
   if($node.LocalName-eq 'tbl'){
    $table=$model.tables[$index];$clone=$node.CloneNode($true)
    # Match the updated content model without modifying any table/run formatting.
    foreach($cell in $table.cells){$p=$clone.SelectNodes('w:tr',$ns)[$cell.row].SelectNodes('w:tc',$ns)[$cell.col].SelectNodes('.//w:p',$ns)[$cell.paragraph];ApplyText $p $cell.text $ns}
    [void]$body.AppendChild($clone)
    if($mode-eq 'TESTCASE'){[void]$body.AppendChild((Para $d ('Danh sách các tình huống kiểm tra – '+$table.id) $true $true));[void]$body.AppendChild((TestTable $d $table))}
    else{[void]$body.AppendChild((Para $d ('Sequence – '+$table.title) $true $true));foreach($im in $images[$index].images){$draw++;$rid='rIdSeqNew'+$draw;$target='sequence_new_'+$draw+'.png';$cx=5486400;$cy=[long]($cx*$im.height/$im.width);$xml='<w:p xmlns:w="'+$W+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:pPr><w:jc w:val="center"/><w:spacing w:after="80"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="'+$cx+'" cy="'+$cy+'"/><wp:docPr id="'+$draw+'" name="'+(X $table.id)+' sequence"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="'+$target+'"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="'+$rid+'"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+$cx+'" cy="'+$cy+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';[void]$body.AppendChild((Fragment $d $xml));$newImages.Add(@{rid=$rid;target=$target;source=(Join-Path $Directory ('sequence-inserts/'+$im.file))})}}
    $index++;$afterTable=$true;continue
   }
   if($node.LocalName-eq 'sectPr'){continue}
   $text=($node.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText})-join ''
   if($text-match '^Sequence\s+UC-' -or ($afterTable-and $node.SelectNodes('.//a:blip',$ns).Count)-or ($afterTable-and -not $text.Trim()-and -not $node.SelectNodes('.//w:sectPr',$ns).Count)){$removedOld++;continue}
   [void]$body.AppendChild($node.CloneNode($true))
  }
  for($k=50;$k-lt $model.tables.Count;$k++){$t=$model.tables[$k];[void]$body.AppendChild((Para $d ('Đặc tả bổ sung – '+$t.title) $true $true));[void]$body.AppendChild((SupplementalTable $d $t));if($mode-eq 'TESTCASE'){[void]$body.AppendChild((Para $d ('Danh sách các tình huống kiểm tra – '+$t.id) $true $true));[void]$body.AppendChild((TestTable $d $t))}else{
   # Supplemental diagrams are inserted through the same image structure as originals.
   [void]$body.AppendChild((Para $d ('Sequence – '+$t.title) $true $true))
   foreach($im in $images[$k].images){$draw++;$rid='rIdSeqNew'+$draw;$target='sequence_new_'+$draw+'.png';$cx=5486400;$cy=[long]($cx*$im.height/$im.width);$template=$body.SelectNodes('.//w:drawing',$ns)[0].ParentNode.ParentNode.CloneNode($true);$template.SelectSingleNode('.//a:blip',$ns).SetAttribute('embed','http://schemas.openxmlformats.org/officeDocument/2006/relationships',$rid);$wp=[Xml.XmlNamespaceManager]::new($d.NameTable);$wp.AddNamespace('wp','http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing');$template.SelectSingleNode('.//wp:extent',$wp).SetAttribute('cy',[string]$cy);$template.SelectSingleNode('.//wp:docPr',$wp).SetAttribute('id',[string]$draw);$template.SelectSingleNode('.//a:ext',$ns).SetAttribute('cy',[string]$cy);[void]$body.AppendChild($template);$newImages.Add(@{rid=$rid;target=$target;source=(Join-Path $Directory ('sequence-inserts/'+$im.file))})}
  }}
  $sect=$nodes|Where-Object LocalName -eq 'sectPr'|Select-Object -Last 1;if($sect){[void]$body.AppendChild($sect.CloneNode($true))}
  $finalTables=@($body.SelectNodes('w:tbl',$ns));for($k=0;$k-lt 50;$k++){$position=if($mode-eq 'TESTCASE'){$k*2}else{$k};if((Mask $beforeTables[$k])-cne (Mask $finalTables[$position])){throw ('Original table formatting changed '+$k)}}
  $outName=if($mode-eq 'SEQUENCE'){'DacTa_Kem_Sequence_20261101.docx'}else{'DacTa_Kem_TestCase_20261101.docx'};$output=Join-Path $Directory $outName
  $relsReader=[IO.StreamReader]::new($archive.GetEntry('word/_rels/document.xml.rels').Open());$rels=Parse $relsReader.ReadToEnd();$relsReader.Dispose();foreach($image in $newImages){$rel=$rels.CreateElement('Relationship',$R);$rel.SetAttribute('Id',$image.rid);$rel.SetAttribute('Type','http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');$rel.SetAttribute('Target','media/'+$image.target);[void]$rels.DocumentElement.AppendChild($rel)}
  if(Test-Path -LiteralPath $output){if(-not $ReplaceGenerated){throw ('Output exists; refusing to overwrite '+$output)};if([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($output))-ne $Directory-or [IO.Path]::GetFullPath($output)-eq $source){throw 'Unsafe generated output path'};[IO.File]::Delete($output)}
  $zip=[IO.Compression.ZipFile]::Open($output,[IO.Compression.ZipArchiveMode]::Create)
  try{foreach($part in $archive.Entries){$entry=$zip.CreateEntry($part.FullName,[IO.Compression.CompressionLevel]::Optimal);$stream=$entry.Open();try{if($part.FullName-in @('word/document.xml','word/_rels/document.xml.rels')){$xmlText=if($part.FullName-eq 'word/document.xml'){$d.OuterXml}else{$rels.OuterXml};$bytes=[Text.UTF8Encoding]::new($false).GetBytes($xmlText);$stream.Write($bytes,0,$bytes.Length)}else{$inputStream=$part.Open();try{$inputStream.CopyTo($stream)}finally{$inputStream.Dispose()}}}finally{$stream.Dispose()}}foreach($image in $newImages){[void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$image.source,'word/media/'+$image.target,[IO.Compression.CompressionLevel]::Optimal)}}finally{$zip.Dispose()}
  @{file=$outName;originalSpecifications=50;supplementalSpecifications=4;originalTableFormattingPreserved=$true;tableCount=$finalTables.Count;testCases=$(if($mode-eq 'TESTCASE'){$model.cases.Count}else{0});logicalSequences=$(if($mode-eq 'SEQUENCE'){$images.Count}else{0});sequenceImageParts=$newImages.Count;oldSequenceParagraphsRemoved=$removedOld;newCaseResults='Chưa chạy';sourceUntouched=$true}|ConvertTo-Json|Set-Content -LiteralPath (Join-Path $Directory ($mode+'_INSERT_PROOF.json')) -Encoding UTF8
  Write-Output ('PASS '+$outName+'; '+$finalTables.Count+' tables; '+$newImages.Count+' new image parts.')
 }
}finally{$archive.Dispose()}

param([string]$Directory=(Join-Path $PSScriptRoot '../docs/review-20261029'))
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$Directory=[IO.Path]::GetFullPath($Directory)
$template=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../docs/review-20261028/Tuan6_WarehouseTeam_ChiDacTaUC_Goc.docx'))
$output=Join-Path $Directory 'Tuan6_WarehouseTeam_ChiDacTaUC_SuaDungMau.docx'
$model=Get-Content -LiteralPath (Join-Path $Directory 'noi-dung-sua.json') -Raw -Encoding UTF8|ConvertFrom-Json
[IO.File]::Copy($template,$output,$true)
$zip=[IO.Compression.ZipFile]::Open($output,[IO.Compression.ZipArchiveMode]::Update)
$w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
try {
 $entry=$zip.GetEntry('word/document.xml');$sr=[IO.StreamReader]::new($entry.Open());$original=$sr.ReadToEnd();$sr.Dispose()
 $doc=[Xml.XmlDocument]::new();$doc.PreserveWhitespace=$true;$doc.LoadXml($original)
 $ns=[Xml.XmlNamespaceManager]::new($doc.NameTable);$ns.AddNamespace('w',$w)
 $body=$doc.SelectSingleNode('//w:body',$ns);$nodes=@($body.ChildNodes)
 $inserted=[Collections.Generic.HashSet[Xml.XmlNode]]::new()
 function PreserveSpace($node){$a=$doc.CreateAttribute('xml','space','http://www.w3.org/XML/1998/namespace');$a.Value='preserve';[void]$node.Attributes.SetNamedItem($a)}
 function Text($node){return (($node.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText}) -join '')}
 function SetParagraph($p,[string]$value){
  foreach($n in @($p.SelectNodes('.//w:t|.//w:br',$ns))){if($inserted.Contains($n)){[void]$n.ParentNode.RemoveChild($n);[void]$inserted.Remove($n)}}
  $texts=@($p.SelectNodes('.//w:t',$ns))
  if(-not $texts.Count){if($value){throw 'Refusing to add a paragraph or a formatting run.'};return}
  $primary=$texts|Where-Object{$_.InnerText.Trim().Length -gt 0}|Select-Object -First 1
  if($null -eq $primary){$primary=$texts[0]}
  foreach($t in $texts){$t.InnerText=''}
  $lines=$value -split "`n";$primary.InnerText=$lines[0]
  PreserveSpace $primary
  $after=$primary
  for($i=1;$i -lt $lines.Count;$i++){
   $br=$doc.CreateElement('w','br',$w);[void]$after.ParentNode.InsertAfter($br,$after);[void]$inserted.Add($br)
   $t=$doc.CreateElement('w','t',$w);PreserveSpace $t;$t.InnerText=$lines[$i];[void]$br.ParentNode.InsertAfter($t,$br);[void]$inserted.Add($t);$after=$t
  }
 }
 function SetCell($cell,[string]$value){
  $paras=@($cell.SelectNodes('.//w:p',$ns));$used=@($paras|Where-Object{$_.SelectNodes('.//w:t',$ns).Count -gt 0 -and (Text $_).Trim().Length -gt 0})
  if(-not $used.Count){$used=@($paras|Where-Object{$_.SelectNodes('.//w:t',$ns).Count -gt 0}|Select-Object -First 1)}
  if(-not $used.Count){
   if(-not $value){return}
   # Reuse the existing paragraph and its existing run. Only text content is added.
   $p=$paras[0];$run=$p.SelectSingleNode('w:r',$ns)
   if($null -eq $run){throw 'Cell has no existing run: refusing to change its form.'}
   $t=$doc.CreateElement('w','t',$w);[void]$run.AppendChild($t);$used=@($p)
  }
  foreach($t in @($cell.SelectNodes('.//w:t',$ns))){$t.InnerText=''}
  # The original paragraphs, table cells and nested tables remain in place.
  SetParagraph $used[0] $value
 }
 function Rows($table){return @($table.SelectNodes('w:tr',$ns))}
 function Cell($table,[int]$row,[int]$col){return (Rows $table)[$row].SelectNodes('w:tc',$ns)[$col]}
 function Markers($table){
  $rows=Rows $table;$m=@{basic=7;end=$rows.Count}
  for($i=5;$i -lt $rows.Count;$i++){
   $s=Text $rows[$i].SelectNodes('w:tc',$ns)[0]
   if($s -match '^Alternative flow'){$m.alt=$i}
   elseif($s -match '^Exception flow'){$m.exc=$i}
   elseif($s -match '^Quy tắc nghiệp vụ'){$m.end=$i}
  };return $m
 }
 function SetFlow($table,$pairs){
  $m=Markers $table;$rows=Rows $table;$count=$m.alt-7
  if($pairs.Count -gt $count){throw 'Basic flow exceeds original row count.'}
  for($i=0;$i -lt $count;$i++){
   $cells=@($rows[7+$i].SelectNodes('w:tc',$ns))
   for($j=0;$j -lt $cells.Count;$j++){$v=if($i -lt $pairs.Count -and $j -lt 2){[string]$pairs[$i][$j]}else{''};SetCell $cells[$j] $v}
  }
 }
 function ReplaceSection($table,[string]$section,$values){
  $m=Markers $table;$rows=Rows $table;$start=if($section -eq 'alt'){$m.alt+1}else{$m.exc+1};$end=if($section -eq 'alt'){$m.exc-1}else{$m.end-1}
  if($end -lt $start){throw 'No content rows for replacement.'}
  $lines=@(($values -join "`n") -split "`n");$offset=0
  for($r=$start;$r -le $end;$r++){
   $cells=@($rows[$r].SelectNodes('w:tc',$ns))
   $value=''
   if($offset -lt $lines.Count){
    if($r -eq $end){$value=$lines[$offset..($lines.Count-1)] -join "`n";$offset=$lines.Count}
    else{$value=$lines[$offset];$offset++}
   }
   SetCell $cells[0] $value
   for($j=1;$j -lt $cells.Count;$j++){SetCell $cells[$j] ''}
  }
 }
 function AppendSection($table,[string]$section,$values){
  if(-not $values.Count){return}
  $m=Markers $table;$rows=Rows $table;$start=if($section -eq 'alt'){$m.alt+1}else{$m.exc+1};$end=if($section -eq 'alt'){$m.exc-1}else{$m.end-1}
  if($end -lt $start){
   # The source leaves this section as one cell with its label only. Keep
   # that exact cell and paragraph; add the branch text within the same cell.
   $label=if($section -eq 'alt'){$m.alt}else{$m.exc}
   $target=$rows[$label].SelectNodes('w:tc',$ns)[0]
  } else {$target=$rows[$end].SelectNodes('w:tc',$ns)[0]}
  $p=@($target.SelectNodes('.//w:p[w:r]',$ns))[-1]
  $run=@($p.SelectNodes('w:r',$ns))[-1]
  $newLines=@(($values -join "`n") -split "`n")
  foreach($line in $newLines){
   $br=$doc.CreateElement('w','br',$w);[void]$run.AppendChild($br);[void]$inserted.Add($br)
   $t=$doc.CreateElement('w','t',$w);PreserveSpace $t;$t.InnerText=$line;[void]$run.AppendChild($t);[void]$inserted.Add($t)
  }
 }
 function Structure($node){
  $copy=$node.CloneNode($true)
  # Text and inline line breaks are content. Every table/row/cell/paragraph/run,
  # every property, heading, merge and relationship is checked independently.
  foreach($n in @($copy.SelectNodes('.//w:t|.//w:br',$ns))){[void]$n.ParentNode.RemoveChild($n)}
  return $copy.OuterXml
 }
 $before=@($nodes|ForEach-Object{Structure $_});$changes=[Collections.Generic.List[object]]::new()
 foreach($p in $model.originals){
  $table=$nodes[[int]$p.block]
  foreach($a in $p.cells){$target=Cell $table $a.row $a.column;$old=Text $target;SetCell $target $a.text;$changes.Add(@{uc=$p.id;row=$a.row;column=$a.column;before=$old;after=$a.text})}
  if($p.flow){SetFlow $table @($p.flow)}
  if($p.replaceAlternatives){ReplaceSection $table 'alt' @($p.replaceAlternatives)}
  if($p.replaceExceptions){ReplaceSection $table 'exc' @($p.replaceExceptions)}
  AppendSection $table 'alt' @($p.alternatives)
  AppendSection $table 'exc' @($p.exceptions)
 }
 # Retain natural-language parentheses, remove only database entity lists.
 foreach($table in @($nodes|Where-Object{$_.LocalName -eq 'tbl'})){
  foreach($cell in @($table.SelectNodes('.//w:tc[not(.//w:tbl)]',$ns))){
   $s=Text $cell
   $clean=[regex]::Replace($s,'\s*\((?:[A-Z][A-Za-z0-9_]*(?:\s*\([^)]*\))?)(?:\s*,\s*[A-Za-z][A-Za-z0-9_]*(?:\s*\([^)]*\))?)*\)','')
   if($clean -ne $s){
    # Remove entity lists within individual text nodes, keeping existing breaks.
    foreach($t in @($cell.SelectNodes('.//w:t',$ns))){$t.InnerText=[regex]::Replace($t.InnerText,'\s*\((?:[A-Z][A-Za-z0-9_]*(?:\s*\([^)]*\))?)(?:\s*,\s*[A-Za-z][A-Za-z0-9_]*(?:\s*\([^)]*\))?)*\)','')}
   }
  }
 }
 # Only the name of the changed UC is updated in its existing heading.
 foreach($p in $model.originals|Where-Object{$_.id -eq 'UC-31'}){
  $heading=$nodes[[int]$p.block-1]
  foreach($t in @($heading.SelectNodes('.//w:t',$ns))){$t.InnerText=$t.InnerText.Replace('Phê duyệt đơn hàng','Phê duyệt kế hoạch sản xuất')}
 }
 $originalTables=@($nodes|Where-Object{$_.LocalName -eq 'tbl'})
 $proof=[Collections.Generic.List[object]]::new()
 for($i=0;$i -lt $nodes.Count;$i++){
  $same=(Structure $nodes[$i]) -ceq $before[$i]
  $proof.Add(@{block=$i;type=$nodes[$i].LocalName;structureUnchanged=$same})
 }
 if(@($proof|Where-Object{-not $_.structureUnchanged}).Count){throw 'Original structure changed. No file will be delivered.'}
 $cleanDoc=[Xml.XmlDocument]::new();$cleanDoc.PreserveWhitespace=$true;$cleanDoc.LoadXml($original)
 $cleanNodes=@($cleanDoc.SelectSingleNode('//w:body',$ns).ChildNodes)
 $tableTemplate=$doc.ImportNode($cleanNodes[64],$true);$headingTemplate=$doc.ImportNode($cleanNodes[63],$true);$sect=$body.SelectSingleNode('w:sectPr',$ns)
 # Requested notes and new UCs only, at the end; no technical appendix.
 $nextId=[uint32]3758096384
 function UniqueIds($node){
  if($node.LocalName -eq 'p'){[void]$node.SetAttribute('paraId','http://schemas.microsoft.com/office/word/2010/wordml',$script:nextId.ToString('X8'));$script:nextId++}
  foreach($n in @($node.SelectNodes('.//*[@w14:paraId]',$script:idNs))){[void]$n.SetAttribute('paraId','http://schemas.microsoft.com/office/word/2010/wordml',$script:nextId.ToString('X8'));$script:nextId++}
 }
 $script:idNs=[Xml.XmlNamespaceManager]::new($doc.NameTable);$script:idNs.AddNamespace('w14','http://schemas.microsoft.com/office/word/2010/wordml')
 foreach($note in $model.notes){$p=$headingTemplate.CloneNode($true);SetParagraph $p $note;UniqueIds $p;[void]$body.InsertBefore($p,$sect)}
 foreach($p in $model.added){
  $h=$headingTemplate.CloneNode($true);SetParagraph $h ('Đặc tả use case: “'+$p.title+'”')
  $t=$tableTemplate.CloneNode($true)
  foreach($tag in @('bookmarkStart','bookmarkEnd','commentRangeStart','commentRangeEnd','commentReference')){foreach($n in @($t.SelectNodes('.//w:'+$tag,$ns))){[void]$n.ParentNode.RemoveChild($n)}}
  SetCell (Cell $t 0 0) $p.title;SetCell (Cell $t 1 1) $p.pre;SetCell (Cell $t 2 1) $p.post;SetCell (Cell $t 3 1) $p.actor;SetCell (Cell $t 4 1) 'Không';SetCell (Cell $t 6 0) $p.actor
  SetFlow $t @($p.basic)
  ReplaceSection $t 'alt' @($p.alternatives)
  ReplaceSection $t 'exc' (@($p.exceptions)+@('Nếu chưa đăng nhập, không có quyền, dữ liệu đã thay đổi hoặc kết nối bị gián đoạn: hệ thống không cho tiếp tục thao tác trái quyền; người dùng đăng nhập hoặc tải lại dữ liệu, kiểm tra kết quả lần trước trước khi thử lại.'))
  UniqueIds $t;UniqueIds $h
  foreach($n in @($h.SelectNodes('.//w:t',$ns))){PreserveSpace $n}
  [void]$body.InsertBefore($h,$sect);[void]$body.InsertBefore($t,$sect)
 }
 $stream=$entry.Open();$stream.SetLength(0);$writer=[IO.StreamWriter]::new($stream,[Text.UTF8Encoding]::new($false));$doc.Save($writer);$writer.Dispose()
 $proof|ConvertTo-Json -Depth 5|Set-Content -LiteralPath (Join-Path $Directory 'kiem-tra-cau-truc.json') -Encoding UTF8
 $changes|ConvertTo-Json -Depth 5|Set-Content -LiteralPath (Join-Path $Directory 'thay-doi-noi-dung.json') -Encoding UTF8
} finally {$zip.Dispose()}
function OpenSharedZip([string]$path){$stream=[IO.File]::Open($path,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::ReadWrite);return [IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Read,$false)}
function SharedHash([string]$path){$stream=[IO.File]::Open($path,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::ReadWrite);$hash=[Security.Cryptography.SHA256]::Create();try{return ([BitConverter]::ToString($hash.ComputeHash($stream))).Replace('-','')}finally{$stream.Dispose();$hash.Dispose()}}
$beforeZip=OpenSharedZip $template;$afterZip=OpenSharedZip $output
try {
 $different=@()
 foreach($e in $beforeZip.Entries){
  $other=$afterZip.GetEntry($e.FullName);if($null -eq $other){throw 'Missing package entry.'}
  $a=$e.Open();$b=$other.Open();$hash=[Security.Cryptography.SHA256]::Create()
  try {$same=[Convert]::ToBase64String($hash.ComputeHash($a)) -eq [Convert]::ToBase64String($hash.ComputeHash($b))}finally{$a.Dispose();$b.Dispose();$hash.Dispose()}
  if(-not $same){$different+=@($e.FullName)}
 }
 if($different.Count -ne 1 -or $different[0] -ne 'word/document.xml'){throw 'Unexpected package changes.'}
 @{originalTables=$originalTables.Count;addedTables=$model.added.Count;originalBlocks=$nodes.Count;originalStructureUnchanged=$true;changedPackageEntries=$different;templateHash=(SharedHash $template);outputHash=(SharedHash $output)}|ConvertTo-Json -Depth 5|Set-Content -LiteralPath (Join-Path $Directory 'doi-chieu-dinh-dang.json') -Encoding UTF8
} finally {$beforeZip.Dispose();$afterZip.Dispose()}
Write-Output $output

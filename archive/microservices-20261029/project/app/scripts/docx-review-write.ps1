param(
  [string]$Source='T:\Năm 4\HK1\Phát triển ứng dụng\Tuan6_WarehouseTeam_ChiDacTaUC.docx',
  [string]$ReviewDirectory=(Join-Path $PSScriptRoot '../docs/review-20261028')
)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$ReviewDirectory=[IO.Path]::GetFullPath($ReviewDirectory)
$model=Get-Content -LiteralPath (Join-Path $ReviewDirectory 'docx-content-model.json') -Encoding UTF8 -Raw | ConvertFrom-Json
$output=Join-Path $ReviewDirectory 'Tuan6_WarehouseTeam_ChiDacTaUC_DaRasoat_20261028.docx'
$backup=Join-Path $ReviewDirectory 'Tuan6_WarehouseTeam_ChiDacTaUC_Goc.docx'
if(-not (Test-Path -LiteralPath $backup)){[IO.File]::Copy($Source,$backup,$false)}
$sourceHash=(Get-FileHash -LiteralPath $Source -Algorithm SHA256).Hash
# This dated review is reproducible from its immutable original snapshot even
# after the requested source file has been replaced with the reviewed version.
$templateHash=(Get-FileHash -LiteralPath $backup -Algorithm SHA256).Hash
[IO.File]::Copy($backup,$output,$true)
$zip=[IO.Compression.ZipFile]::Open($output,[IO.Compression.ZipArchiveMode]::Update)
$w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
try{
 $reader=[IO.StreamReader]::new($zip.GetEntry('word/document.xml').Open());$xml=$reader.ReadToEnd();$reader.Dispose()
 $doc=[Xml.XmlDocument]::new();$doc.PreserveWhitespace=$true;$doc.LoadXml($xml)
 $ns=[Xml.XmlNamespaceManager]::new($doc.NameTable);$ns.AddNamespace('w',$w)
 $body=$doc.SelectSingleNode('//w:body',$ns);$nodes=@($body.ChildNodes)
 function CellText($cell){return (($cell.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText}) -join '')}
 function SetParagraph($p,[string]$value){
  $texts=@($p.SelectNodes('.//w:t',$ns));foreach($t in $texts){$t.InnerText=''}
  if($texts.Count){$first=$texts[0];$run=$first.ParentNode}else{$run=$p.SelectSingleNode('w:r',$ns);if($null -eq $run){$run=$doc.CreateElement('w','r',$w);[void]$p.AppendChild($run)};$first=$doc.CreateElement('w','t',$w);[void]$run.AppendChild($first)}
  $parts=$value -split "`n",0,'SimpleMatch';$first.InnerText=$parts[0];[void]$first.SetAttribute('space','http://www.w3.org/XML/1998/namespace','preserve')
  for($k=1;$k -lt $parts.Count;$k++){$br=$doc.CreateElement('w','br',$w);[void]$run.AppendChild($br);$t=$doc.CreateElement('w','t',$w);[void]$t.SetAttribute('space','http://www.w3.org/XML/1998/namespace','preserve');$t.InnerText=$parts[$k];[void]$run.AppendChild($t)}
 }
 function SetCell($cell,[string]$text){
  $paragraphs=@($cell.SelectNodes('.//w:p',$ns));if(-not $paragraphs.Count){throw 'Cell has no paragraph; refusing to change structure.'}
  $primary=$null
  foreach($p in $paragraphs){if($null -eq $primary -and ((($p.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText}) -join '').Length -gt 0)){$primary=$p}}
  if($null -eq $primary){$primary=$paragraphs[0]}
  foreach($p in $paragraphs){foreach($t in @($p.SelectNodes('.//w:t',$ns))){$t.InnerText=''}}
  if($text.Length){SetParagraph $primary $text}
 }
 function LayoutFingerprint($node){
  $s=($node.SelectNodes('.//w:tblPr|.//w:tblGrid|.//w:trPr|.//w:tcPr|.//w:pPr|.//w:rPr',$ns)|ForEach-Object{$_.OuterXml}) -join "`n"
  return [Convert]::ToBase64String([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($s)))
 }
 function Flow($rows,[int]$start,[int]$end,$entries,[bool]$paired){
  if($end -lt $start){return}
  for($j=$start;$j -le $end;$j++){
   $offset=$j-$start;$cells=@($rows[$j].SelectNodes('w:tc',$ns));$leftLines=[Collections.Generic.List[string]]::new();$rightLines=[Collections.Generic.List[string]]::new()
   $limit=if($j -eq $end){$entries.Count}else{[Math]::Min($offset+1,$entries.Count)}
   for($k=$offset;$k -lt $limit;$k++){if($paired){$leftLines.Add([string]$entries[$k][0]);$rightLines.Add([string]$entries[$k][1])}else{$leftLines.Add([string]$entries[$k])}}
   if($paired){if($cells.Count -eq 1){SetCell $cells[0] (($leftLines.ToArray()+$rightLines.ToArray()) -join "`n")}else{SetCell $cells[0] ($leftLines -join "`n");SetCell $cells[1] ($rightLines -join "`n")}}
   else{SetCell $cells[0] ($leftLines -join "`n");for($c=1;$c -lt $cells.Count;$c++){SetCell $cells[$c] ''}}
  }
 }
 function RewriteTable($table,$profile){
  $rows=@($table.SelectNodes('w:tr',$ns));if($rows.Count -lt 10){throw 'Unexpected UC table form.'}
  if($profile.title){SetCell $rows[0].SelectNodes('w:tc',$ns)[0] $profile.title}
  $secondary=if($profile.secondary){$profile.secondary}else{'Không'}
  foreach($pair in @(@(1,$profile.pre),@(2,$profile.post),@(3,$profile.actor),@(4,$secondary))){$cells=@($rows[$pair[0]].SelectNodes('w:tc',$ns));if($cells.Count -gt 1){SetCell $cells[1] ([string]$pair[1])}}
  $headers=@{};for($i=5;$i -lt $rows.Count;$i++){$v=CellText $rows[$i].SelectNodes('w:tc',$ns)[0];if($v -match '^Alternative flow'){$headers.alt=$i}elseif($v -match '^Exception flow'){$headers.exc=$i}elseif($v -match '^Quy tắc nghiệp vụ'){$headers.rules=$i}}
  if(-not $headers.ContainsKey('alt') -or -not $headers.ContainsKey('exc')){throw 'UC flow headers missing.'}
  $actorCells=@($rows[6].SelectNodes('w:tc',$ns));SetCell $actorCells[0] $profile.actor
  Flow $rows 7 ($headers.alt-1) @($profile.basic) $true
  if($headers.exc -gt $headers.alt+1){Flow $rows ($headers.alt+1) ($headers.exc-1) @($profile.alternatives) $false}else{SetCell $rows[$headers.alt].SelectNodes('w:tc',$ns)[0] ("Alternative flow`n"+($profile.alternatives -join "`n"))}
  $exceptions=@($profile.exceptions);if($profile.commonRef){$exceptions+=@($profile.commonRef)}
  $last=if($headers.ContainsKey('rules')){$headers.rules-1}else{$rows.Count-1}
  if($last -gt $headers.exc){Flow $rows ($headers.exc+1) $last $exceptions $false}else{SetCell $rows[$headers.exc].SelectNodes('w:tc',$ns)[0] ("Exception flow`n"+($exceptions -join "`n"))}
  if($headers.ContainsKey('rules')){Flow $rows ($headers.rules+1) ($rows.Count-1) @($profile.rules) $false}
 }
 $before=@();foreach($p in $model.originals){$node=$nodes[[int]$p.block];$before+=@{block=$p.block;layout=(LayoutFingerprint $node);rows=$node.SelectNodes('w:tr',$ns).Count;cells=$node.SelectNodes('.//w:tc',$ns).Count;paragraphs=$node.SelectNodes('.//w:p',$ns).Count}}
 $template=$nodes[9].CloneNode($true);$headingTemplate=$nodes[8].CloneNode($true)
 foreach($p in $model.originals){RewriteTable $nodes[[int]$p.block] $p}
 foreach($p in $model.originals|Where-Object{$_.title}){
  $idx=[int]$p.block-1;if($nodes[$idx].LocalName -eq 'p' -and (CellText $nodes[$idx]) -match 'Đặc tả use case'){SetParagraph $nodes[$idx] ('Đặc tả use case: “'+($p.title -replace '^UC-[\d.]+\s*','')+'”')}
 }
 $sect=$body.SelectSingleNode('w:sectPr',$ns)
 $appendParagraphId=[Convert]::ToUInt32('D0000000',16)
 $appendedNodes=[Collections.Generic.List[object]]::new()
 $appendedTableCount=0
 $bodyParagraphTemplate=$template.SelectNodes('w:tr',$ns)[7].SelectNodes('w:tc',$ns)[1].SelectNodes('.//w:p',$ns)[0].CloneNode($true)
 foreach($p in $model.append){
  $heading=$headingTemplate.CloneNode($true);SetParagraph $heading $p.title
  if(-not $p.id){
   [void]$heading.SetAttribute('paraId','http://schemas.microsoft.com/office/word/2010/wordml',$appendParagraphId.ToString('X8'));$appendParagraphId++
   [void]$body.InsertBefore($heading,$sect)
   $parts=@($p.pre,$p.post,$p.actor)+@($p.basic|ForEach-Object{$_[0]+' — '+$_[1]})+@($p.alternatives)+@($p.exceptions)
   foreach($value in $parts){if($value){$paragraph=$bodyParagraphTemplate.CloneNode($true);SetParagraph $paragraph ([string]$value);[void]$paragraph.SetAttribute('paraId','http://schemas.microsoft.com/office/word/2010/wordml',$appendParagraphId.ToString('X8'));$appendParagraphId++;[void]$body.InsertBefore($paragraph,$sect)}}
   $appendedNodes.Add(@{node=$body;profile=$p})
   continue
  }
  $table=$template.CloneNode($true)
  foreach($tag in @('bookmarkStart','bookmarkEnd','commentRangeStart','commentRangeEnd','commentReference')){foreach($node in @($table.SelectNodes('.//w:'+$tag,$ns))){[void]$node.ParentNode.RemoveChild($node)}}
  RewriteTable $table $p
  foreach($paragraph in (@($heading)+@($table.SelectNodes('.//w:p',$ns)))){[void]$paragraph.SetAttribute('paraId','http://schemas.microsoft.com/office/word/2010/wordml',$appendParagraphId.ToString('X8'));$appendParagraphId++}
  $appendedNodes.Add(@{node=$table;profile=$p})
  $appendedTableCount++
  [void]$body.InsertBefore($heading,$sect);[void]$body.InsertBefore($table,$sect)
 }
 $proof=@();foreach($p in $before){$node=$nodes[[int]$p.block];$proof+=@{block=$p.block;layoutUnchanged=((LayoutFingerprint $node) -eq $p.layout);rowsUnchanged=($node.SelectNodes('w:tr',$ns).Count -eq $p.rows);cellsUnchanged=($node.SelectNodes('.//w:tc',$ns).Count -eq $p.cells);paragraphsUnchanged=($node.SelectNodes('.//w:p',$ns).Count -eq $p.paragraphs)}}
 if(@($proof|Where-Object{-not $_.layoutUnchanged -or -not $_.rowsUnchanged -or -not $_.cellsUnchanged -or -not $_.paragraphsUnchanged}).Count){throw 'Original UC form preservation failed.'}
 $contentChecks=[Collections.Generic.List[object]]::new()
 $allChecks=@($model.originals|ForEach-Object{@{node=$nodes[[int]$_.block];profile=$_}})+@($appendedNodes.ToArray())
 $bodyText=(($body.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText}) -join '')
 foreach($check in $allChecks){
  $profile=$check.profile;$text=if([object]::ReferenceEquals($check.node,$body)){$bodyText}else{(($check.node.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText}) -join '')}
  $wanted=@($profile.pre,$profile.post,$profile.actor)+@($profile.basic|ForEach-Object{$_[0];$_[1]})+@($profile.alternatives)+@($profile.exceptions)+@($profile.rules)
  foreach($value in $wanted){if($value){$normalized=([string]$value).Replace("`r",'').Replace("`n",'');if(-not $text.Replace("`r",'').Replace("`n",'').Contains($normalized)){throw ('Missing editorial content: '+$profile.title+' '+$profile.id+' '+$normalized.Substring(0,[Math]::Min(80,$normalized.Length)))}}}
  $contentChecks.Add(@{title=$profile.title;id=$profile.id;allExpectedContentPresent=$true})
 }
 [IO.File]::WriteAllText((Join-Path $ReviewDirectory 'DOCX_CONTENT_PROOF.json'),(ConvertTo-Json -InputObject @($contentChecks.ToArray()) -Depth 5),[Text.UTF8Encoding]::new($false))
 $entry=$zip.GetEntry('word/document.xml');$entry.Delete();$newEntry=$zip.CreateEntry('word/document.xml',[IO.Compression.CompressionLevel]::Optimal);$stream=$newEntry.Open();$settings=[Xml.XmlWriterSettings]::new();$settings.Encoding=[Text.UTF8Encoding]::new($false);$settings.Indent=$false;$writer=[Xml.XmlWriter]::Create($stream,$settings);$doc.Save($writer);$writer.Dispose();$stream.Dispose()
 $proofJson=@{sourceSha256=$sourceHash;sourceUnmodifiedDuringGeneration=((Get-FileHash -LiteralPath $Source -Algorithm SHA256).Hash -eq $sourceHash);originalTables=$model.originals.Count;appendedTables=$appendedTableCount;originalFormChecks=$proof;output=$output;visualWordPagination='Microsoft Word not installed. LibreOffice render evidence is recorded separately; exact Word pagination is not certified. Text expansion can increase page count.'}|ConvertTo-Json -Depth 12
 [IO.File]::WriteAllText((Join-Path $ReviewDirectory 'DOCX_STRUCTURE_PROOF.json'),$proofJson,[Text.UTF8Encoding]::new($false))
}finally{$zip.Dispose()}
$a=[IO.Compression.ZipFile]::OpenRead($backup);$b=[IO.Compression.ZipFile]::OpenRead($output)
try{
 $changed=@();foreach($entry in $a.Entries){$other=$b.GetEntry($entry.FullName);if($null -eq $other){throw ('Lost package entry '+$entry.FullName)};$s1=$entry.Open();$s2=$other.Open();try{$h=[Security.Cryptography.SHA256]::Create();$h1=[Convert]::ToBase64String($h.ComputeHash($s1));$h2=[Convert]::ToBase64String($h.ComputeHash($s2));if($h1 -ne $h2){$changed+=$entry.FullName}}finally{$s1.Dispose();$s2.Dispose()}}
 if($changed.Count -ne 1 -or $changed[0] -ne 'word/document.xml'){throw ('Unexpected changes outside document body: '+($changed -join ', '))}
 [IO.File]::WriteAllText((Join-Path $ReviewDirectory 'DOCX_PACKAGE_PROOF.json'),(@{changedEntries=$changed;allOtherEntriesByteIdentical=$true;outputSha256=(Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash}|ConvertTo-Json -Depth 4),[Text.UTF8Encoding]::new($false))
}finally{$a.Dispose();$b.Dispose()}
Write-Output $output

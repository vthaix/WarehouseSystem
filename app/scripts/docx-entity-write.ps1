param([string]$Directory=(Join-Path $PSScriptRoot '../docs/review-20261029'))
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$Directory=[IO.Path]::GetFullPath($Directory)
$source=Join-Path $Directory 'Tuan6_WarehouseTeam_ChiDacTaUC_SuaDungMau.docx'
$output=Join-Path $Directory 'Tuan6_WarehouseTeam_ChiDacTaUC_BoSungEntity.docx'
$plan=Get-Content -LiteralPath (Join-Path $Directory 'entity-annotation-plan.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$sourceHash=(Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
[IO.File]::Copy($source,$output,$true)
$z=[IO.Compression.ZipFile]::Open($output,[IO.Compression.ZipArchiveMode]::Update)
$nsUri='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
try {
 $entry=$z.GetEntry('word/document.xml');$sr=[IO.StreamReader]::new($entry.Open());$before=$sr.ReadToEnd();$sr.Dispose()
 $d=[Xml.XmlDocument]::new();$d.PreserveWhitespace=$true;$d.LoadXml($before)
 $n=[Xml.XmlNamespaceManager]::new($d.NameTable);$n.AddNamespace('w',$nsUri)
 $tables=@($d.SelectNodes('//w:body/w:tbl',$n))
 if($tables.Count -ne $plan.tables){throw 'Unexpected table count'}
 foreach($c in $plan.changes){
  $rows=@($tables[$c.table].SelectNodes('w:tr',$n));$cells=@($rows[$c.row].SelectNodes('w:tc',$n));$paras=@($cells[$c.col].SelectNodes('.//w:p',$n));$p=$paras[$c.paragraph]
  $parts=[Collections.Generic.List[object]]::new();$nodes=[Collections.Generic.List[object]]::new()
  foreach($node in $p.SelectNodes('.//w:t|.//w:br',$n)){
   if($node.LocalName -eq 'br'){$parts.Add($nodes.ToArray());$nodes=[Collections.Generic.List[object]]::new()}else{$nodes.Add($node)}
  };$parts.Add($nodes.ToArray())
  $lineNodes=@($parts[$c.line]);$text=($lineNodes|ForEach-Object{$_.InnerText}) -join ''
  if($text -cne $c.text){throw ('Text mismatch: UC-'+$c.uc+' row '+$c.row+' line '+$c.line)}
  if(-not $lineNodes.Count){throw 'Refusing to create text nodes or runs'}
  $suffix=$c.after.Substring($c.text.Length)
  $lineNodes[$lineNodes.Count-1].InnerText += $suffix
 }
 # The only allowed XML changes are existing text-node values.
 function Skeleton([string]$xml){
  $q=[Xml.XmlDocument]::new();$q.PreserveWhitespace=$true;$q.LoadXml($xml)
  if($q.FirstChild -is [Xml.XmlDeclaration]){$q.FirstChild.Encoding='UTF-8'}
  $qn=[Xml.XmlNamespaceManager]::new($q.NameTable);$qn.AddNamespace('w',$nsUri)
  foreach($t in $q.SelectNodes('//w:t',$qn)){$t.InnerText=''}
  return $q.OuterXml
 }
 if((Skeleton $before) -cne (Skeleton $d.OuterXml)){throw 'Structure or formatting changed'}
 $entry.Delete();$new=$z.CreateEntry('word/document.xml');$sw=[IO.StreamWriter]::new($new.Open(),[Text.UTF8Encoding]::new($false));$d.Save($sw);$sw.Dispose()
}finally{$z.Dispose()}
# Rebuild the package instead of leaving the appended ZIP directory produced
# by .NET Update mode, which LibreOffice cannot reliably open for this source.
# This changes ZIP packaging only; each uncompressed part is verified below.
$repacked=$output+'.repacked'
if(Test-Path -LiteralPath $repacked){throw 'A previous repack exists; inspect it before retrying'}
$inputZip=[IO.Compression.ZipFile]::OpenRead($output)
$outputZip=[IO.Compression.ZipFile]::Open($repacked,[IO.Compression.ZipArchiveMode]::Create)
try{
 foreach($part in $inputZip.Entries){
  $newPart=$outputZip.CreateEntry($part.FullName,[IO.Compression.CompressionLevel]::Optimal)
  $inStream=$part.Open();$outStream=$newPart.Open()
  try{$inStream.CopyTo($outStream)}finally{$outStream.Dispose();$inStream.Dispose()}
 }
}finally{$outputZip.Dispose();$inputZip.Dispose()}
[IO.File]::Copy($repacked,$output,$true)
[IO.File]::Delete($repacked)
# Verify every package part, all original text, and every requested suffix.
$a=[IO.Compression.ZipFile]::OpenRead($source);$b=[IO.Compression.ZipFile]::OpenRead($output)
try {
 if($a.Entries.Count -ne $b.Entries.Count){throw 'Package part count changed'}
 $unchanged=0
 foreach($e in $a.Entries){
  $other=$b.GetEntry($e.FullName);if($null -eq $other){throw ('Missing package part '+$e.FullName)}
  if($e.FullName -eq 'word/document.xml'){continue}
  $sha=[Security.Cryptography.SHA256]::Create();$s1=$e.Open();$h1=[Convert]::ToBase64String($sha.ComputeHash($s1));$s1.Dispose();$s2=$other.Open();$h2=[Convert]::ToBase64String($sha.ComputeHash($s2));$s2.Dispose();$sha.Dispose()
  if($h1 -cne $h2){throw ('Changed package part '+$e.FullName)};$unchanged++
 }
 $ar=[IO.StreamReader]::new($a.GetEntry('word/document.xml').Open());$ax=$ar.ReadToEnd();$ar.Dispose()
 $br=[IO.StreamReader]::new($b.GetEntry('word/document.xml').Open());$bx=$br.ReadToEnd();$br.Dispose()
 [xml]$ad=$ax;[xml]$bd=$bx
 $an=[Xml.XmlNamespaceManager]::new($ad.NameTable);$an.AddNamespace('w',$nsUri);$bn=[Xml.XmlNamespaceManager]::new($bd.NameTable);$bn.AddNamespace('w',$nsUri)
 $at=@($ad.SelectNodes('//w:t',$an));$bt=@($bd.SelectNodes('//w:t',$bn))
 if($at.Count -ne $bt.Count){throw 'Text node count changed'}
 $changed=0
 for($i=0;$i -lt $at.Count;$i++){
  if($at[$i].InnerText -cne $bt[$i].InnerText){
   if(-not $bt[$i].InnerText.StartsWith($at[$i].InnerText,[StringComparison]::Ordinal)){throw 'Existing wording changed'}
   $tail=$bt[$i].InnerText.Substring($at[$i].InnerText.Length)
   if($tail -notmatch '^ \([A-Za-z0-9]+(?:, [A-Za-z0-9]+)*\)$'){throw 'Unexpected appended content'}
   $changed++
  }
 }
 if($changed -ne $plan.changes.Count){throw 'Annotation count mismatch'}
 if((Skeleton $ax) -cne (Skeleton $bx)){throw 'Final XML structure mismatch'}
 $result=@{source=$source;output=$output;source_sha256=$sourceHash;output_sha256=(Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash;tables=$tables.Count;annotated_steps=$changed;unchanged_package_parts=$unchanged;all_existing_wording_preserved=$true;all_xml_structure_and_formatting_preserved=$true;original_file_untouched=$true}
 $result|ConvertTo-Json|Set-Content -LiteralPath (Join-Path $Directory 'entity-verification.json') -Encoding UTF8
 $result|ConvertTo-Json
}finally{$a.Dispose();$b.Dispose()}

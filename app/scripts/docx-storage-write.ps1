param([string]$Directory=(Join-Path $PSScriptRoot '../docs/review-20261030'))
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$Directory=[IO.Path]::GetFullPath($Directory)
$source=Join-Path $Directory 'NGUON_GOC.docx'
$output=Join-Path $Directory 'Tuan6_DacTaUC_KemSequence_CapNhatKho_20261030.docx'
$plan=Get-Content -LiteralPath (Join-Path $Directory 'storage-content-plan.json') -Raw -Encoding UTF8|ConvertFrom-Json
$uri='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
$a=[IO.Compression.ZipFile]::OpenRead($source)
try{
 $r=[IO.StreamReader]::new($a.GetEntry('word/document.xml').Open());$before=$r.ReadToEnd();$r.Dispose()
 $d=[Xml.XmlDocument]::new();$d.PreserveWhitespace=$true;$d.LoadXml($before)
 $ns=[Xml.XmlNamespaceManager]::new($d.NameTable);$ns.AddNamespace('w',$uri)
 $tables=@($d.SelectNodes('//w:body/w:tbl',$ns));if($tables.Count-ne 50){throw 'Unexpected source table count'}
 $log=[Collections.Generic.List[object]]::new()
 foreach($change in $plan.changes){
  $cell=$tables[$change.table].SelectNodes('w:tr',$ns)[$change.row].SelectNodes('w:tc',$ns)[$change.col]
  $p=$cell.SelectNodes('.//w:p',$ns)[$change.paragraph];$texts=@($p.SelectNodes('.//w:t',$ns))
  if(-not $texts.Count){throw 'Refusing to add text runs'}
  $old=($texts|ForEach-Object{$_.InnerText}) -join ''
  $new=if($change.append){$old+$change.append}else{$change.text}
  $prefix=0;while($prefix-lt [Math]::Min($old.Length,$new.Length)-and $old[$prefix]-ceq $new[$prefix]){$prefix++}
  $suffix=0;while($suffix-lt [Math]::Min($old.Length-$prefix,$new.Length-$prefix)-and $old[$old.Length-1-$suffix]-ceq $new[$new.Length-1-$suffix]){$suffix++}
  $end=$old.Length-$suffix;$insert=$new.Substring($prefix,$new.Length-$prefix-$suffix);$offset=0;$inserted=$false
  foreach($t in $texts){$s=$t.InnerText;$len=$s.Length;$value=''
   for($i=0;$i-le $len;$i++){
    $pos=$offset+$i
    if(-not $inserted-and $pos-eq $prefix){$value+=$insert;$inserted=$true}
    if($i-lt $len-and ($pos-lt $prefix-or $pos-ge $end)){$value+=$s[$i]}
   }
   $t.InnerText=$value;$offset+=$len
  }
  if((($texts|ForEach-Object{$_.InnerText})-join '')-cne $new){throw 'Text verification failed'}
  $log.Add(@{table=$change.table;row=$change.row;column=$change.col;before=$old;after=$new})
 }
 function Skeleton([string]$xml){$q=[Xml.XmlDocument]::new();$q.PreserveWhitespace=$true;$q.LoadXml($xml);$n=[Xml.XmlNamespaceManager]::new($q.NameTable);$n.AddNamespace('w',$uri);foreach($t in $q.SelectNodes('//w:t',$n)){$t.InnerText=''};return $q.OuterXml}
 if((Skeleton $before)-cne (Skeleton $d.OuterXml)){throw 'Structure/formatting changed'}
 if(Test-Path -LiteralPath $output){throw 'Output already exists; inspect before replacing'}
 $b=[IO.Compression.ZipFile]::Open($output,[IO.Compression.ZipArchiveMode]::Create)
 try{foreach($part in $a.Entries){$target=$b.CreateEntry($part.FullName,[IO.Compression.CompressionLevel]::Optimal);$os=$target.Open();try{if($part.FullName-eq 'word/document.xml'){$bytes=[Text.UTF8Encoding]::new($false).GetBytes($d.OuterXml);$os.Write($bytes,0,$bytes.Length)}else{$is=$part.Open();try{$is.CopyTo($os)}finally{$is.Dispose()}}}finally{$os.Dispose()}}}finally{$b.Dispose()}
 $b=[IO.Compression.ZipFile]::OpenRead($output)
 try{
  if($a.Entries.Count-ne $b.Entries.Count){throw 'Package parts changed'}
  $verified=0
  foreach($part in $a.Entries){if($part.FullName-eq 'word/document.xml'){continue};$target=$b.GetEntry($part.FullName);if(-not $target){throw 'Missing part'};$sha=[Security.Cryptography.SHA256]::Create();$s1=$part.Open();$s2=$target.Open();try{$h1=[Convert]::ToBase64String($sha.ComputeHash($s1));$h2=[Convert]::ToBase64String($sha.ComputeHash($s2));if($h1-cne $h2){throw ('Changed '+$part.FullName)}}finally{$s1.Dispose();$s2.Dispose();$sha.Dispose()};$verified++}
  $r=[IO.StreamReader]::new($b.GetEntry('word/document.xml').Open());$after=$r.ReadToEnd();$r.Dispose();if((Skeleton $before)-cne (Skeleton $after)){throw 'Final structure mismatch'}
  @{sourceSha256=(Get-FileHash $source -Algorithm SHA256).Hash;outputSha256=(Get-FileHash $output -Algorithm SHA256).Hash;tables=50;paragraphs=$d.SelectNodes('//w:p',$ns).Count;changedParagraphs=$log.Count;unchangedPackageParts=$verified;imagesUnchanged=@($a.Entries|Where-Object FullName -Like 'word/media/*').Count;structureAndFormattingIdentical=$true;sequenceImagesUnchanged=$true;addedUCs=0;removedUCs=0}|ConvertTo-Json|Set-Content (Join-Path $Directory 'KIEM_TRA_BAO_TOAN.json') -Encoding UTF8
 }finally{$b.Dispose()}
 $log|ConvertTo-Json -Depth 6|Set-Content (Join-Path $Directory 'THAY_DOI_NOI_DUNG.json') -Encoding UTF8
 Write-Output ('PASS: '+$log.Count+' content changes; 50 tables; all formatting and other package parts unchanged. '+$output)
}finally{$a.Dispose()}

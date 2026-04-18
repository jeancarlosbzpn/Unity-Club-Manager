BEGIN { p=0 }
{
  n_open = gsub(/\(/, "(", $0)
  n_close = gsub(/\)/, ")", $0)
  p += n_open - n_close
  if (p != 0) {
    print NR ": " p
  }
}

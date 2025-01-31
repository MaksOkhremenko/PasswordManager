
function RenderMessage(Message,link,linkText) {
return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/form-style.css">
  <title>problem</title>
</head>
<body>
  <div class="main">
    <h1>${Message}</h1>
    <a class="links" href="/${link}">${linkText}</a>
  </div>
</body>
</html>`
}

module.exports = RenderMessage;
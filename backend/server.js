const { app } = require("./app");

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`\n✅ GitScribe backend running at http://localhost:${PORT}`);
  console.log(`   Health check → http://localhost:${PORT}/`);
  console.log(`   Commits API  → http://localhost:${PORT}/api/commits?url=https://github.com/owner/repo`);
  console.log(`   Repo info    → http://localhost:${PORT}/api/repo?url=https://github.com/owner/repo\n`);
});

fetch("https://registry.npmjs.org")
    .then((res) => console.log("NPM: SUCCESS, status:", res.status))
    .catch((err) => console.log("NPM: FAILED:", err.message));

fetch("https://api.resend.com")
    .then((res) => console.log("RESEND: SUCCESS, status:", res.status))
    .catch((err) => console.log("RESEND: FAILED:", err.message));
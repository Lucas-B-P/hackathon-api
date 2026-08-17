import "dotenv/config";

const required = (name, fallback) => process.env[name] || fallback;

export const env = {
  nodeEnv: required("NODE_ENV", "development"),
  port: Number(required("PORT", "3000")),
  databaseUrl: process.env.DATABASE_URL,
  webOrigins: required("WEB_ORIGIN", "http://localhost:8443,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim()),
  jwtSecret: process.env.JWT_SECRET,
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(required("SMTP_PORT", "587")),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: required("MAIL_FROM", "Patinhas Pet Shop <no-reply@patinhaspetshop.com.br>"),
  },
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL não foi definida no ambiente");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET não foi definida no ambiente");
}

module.exports = {
  apps: [
    {
      name: "app-nestjs",
      script: "dist/main.js",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};

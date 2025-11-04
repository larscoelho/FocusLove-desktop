// electron/main.cjs
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

let win;

function pickEntry() {
  // DEV: usa servidor do Vite
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) return { type: "url", value: devUrl };

  // PROD: tenta dist/web/index.html primeiro (nosso outDir)
  const webIndex = path.join(__dirname, "..", "dist", "web", "index.html");
  if (fs.existsSync(webIndex)) return { type: "file", value: webIndex };

  // Fallback: dist/index.html (caso não tenha separado)
  const rootIndex = path.join(__dirname, "..", "dist", "index.html");
  if (fs.existsSync(rootIndex)) return { type: "file", value: rootIndex };

  return null;
}

function createWindow() {
  win = new BrowserWindow({
    width: 460,
    height: 560,
    minWidth: 460,
    minHeight: 560,
    resizable: false,
    show: false,           // só mostra quando estiver pronto
    frame: false,          // sem moldura
    transparent: true,     // janelinha redonda linda 💖
    backgroundColor: "#00000000",
    title: "FocusLove",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  win.removeMenu();

  const entry = pickEntry();
  if (!entry) {
    dialog.showErrorBox(
      "Erro ao carregar",
      "Não encontrei o index.html (dist/web ou dist). Rode 'npm run build' antes do empacotamento."
    );
    app.quit();
    return;
  }

  if (entry.type === "url") {
    win.loadURL(entry.value).catch((e) => console.error("loadURL failed:", e));
  } else {
    win.loadFile(entry.value).catch((e) => console.error("loadFile failed:", e));
  }

  // Mostra quando estiver pronto (evita janela invisível)
  win.once("ready-to-show", () => {
    if (!win) return;
    win.show();
    // win.webContents.openDevTools({ mode: "detach" }); // habilite se quiser debugar em produção
  });

  // Se falhar carregar, avisa com motivo
  win.webContents.on("did-fail-load", (e, code, desc, url) => {
    console.error("did-fail-load:", code, desc, "url:", url);
    dialog.showErrorBox("Falha ao carregar", `${desc}\nURL: ${url}\nCódigo: ${code}`);
  });

  win.on("closed", () => {
    win = null;
  });
}

// Controles dos botões quadradinhos
ipcMain.on("win:minimize", () => {
  const w = BrowserWindow.getFocusedWindow() || win;
  if (w) w.minimize();
});

ipcMain.on("win:close", () => {
  const w = BrowserWindow.getFocusedWindow() || win;
  if (w) w.close();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

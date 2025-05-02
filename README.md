# aisimpledd
# 🧠 AI Model Builder UI (React Flow)

A visual, drag-and-drop tool to create and connect AI model components — like **Embedding**, **Attention**, **FFN**, and **LM Head** — and auto-generate PyTorch code for them.

---

## ✨ Features

- 🎨 Visual canvas with **drag-and-drop nodes**
- 🔌 Connect layers visually
- ⚙️ **Edit parameters** per node (e.g. `embed_dim`, `num_heads`)
- 📜 Auto-generates PyTorch code based on the flow
- 🚫 Start node is always present and non-deletable
- 🧼 Delete nodes and connections via `Delete` key

---

## 📦 Tech Stack

- [React](https://reactjs.org/)
- [React Flow](https://reactflow.dev/)
- [PyTorch (Code Generation)](https://pytorch.org/)
- [UUID](https://www.npmjs.com/package/uuid)

---

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/srijondasgit/aisimpledd.git
cd aisimpledd/aicanvas
npm install

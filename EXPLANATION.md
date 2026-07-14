# Soroban Guard — Explained Like You're 10

Imagine you have a piggy bank that you made yourself. You love it! But sometimes, without knowing it, you might leave a little crack in the piggy bank. Money could fall out through that crack, and you wouldn't even notice.

**Soroban Guard** is like a friendly robot that looks at your piggy bank before you use it, spots all the cracks, and tells you exactly how to fix them so your money stays safe.

---

## What Is This Repo?

This repo is the **VS Code extension** for Soroban Guard. Think of it as a special pair of glasses that you put on inside your code editor. When you write code for a "smart contract" (a fancy self-running piggy bank on the Stellar network), these glasses highlight problems right there on your screen while you type — like a spellchecker for security!

---

## What Does It Do?

Here are the main things this robot helper can do:

### 1. Spots Problems While You Type
When you write code, Soroban Guard underlines unsafe parts with squiggly lines. Red means danger, yellow means be careful, blue means just a heads-up.

### 2. Fixes Things With One Click
See a red squiggle? Click the lightbulb 💡 and the robot offers to fix it for you. It's like autocomplete, but for security.

### 3. Gives Your Code a Grade
After checking your code, it gives a score out of 100 and a letter grade (A, B, C, etc.). 90+ is great! Below 50 means there's work to do.

### 4. Checks All Your Files at Once
Have a whole folder of code? Run "Scan Workspace" and it checks everything everywhere, all at once.

### 5. Shows a Full Report
A special window pops up with a big score circle, a list of every problem found, and suggestions for how to fix each one.

---

## How Does It Work?

```
┌─────────────────────────┐
│  You write Rust code    │
│  in VS Code             │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Soroban Guard sends    │
│  your code to the       │
│  scanner engine         │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  The engine looks for   │
│  cracks & holes         │
│  (security issues)      │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Results come back      │
│  with red/yellow/blue   │
│  squiggles on your code │
└─────────────────────────┘
```

---

## What Kind of Cracks Does It Find?

| Problem | What It Means |
|---------|---------------|
| **No key check** | You forgot to check "who is knocking" before opening the door |
| **Math that can break** | You're doing math that could overflow (like a car speedometer going past 999,999 and back to 0) |
| **Reentrancy risk** | Someone could call your function over and over before it finishes, like a kid asking "can I have a cookie?" 100 times without waiting for the answer |
| **Missing event log** | Something important happened but nobody wrote it down |
| **No expiration date** | Data lives forever with no way to clean it up |

---

## Who Made This?

This repo was built by the **Veritas Vaults Network** team. We make tools to keep smart contracts safe so people don't lose their digital money.

---

## Can I Help?

Yes! If you know how to code, you can open this project, fix bugs, or add new features. Check the README for how to get started. If you find a problem, tell us by opening an Issue on GitHub.

---

*Remember: A secure piggy bank is a happy piggy bank! 🐷🔒*

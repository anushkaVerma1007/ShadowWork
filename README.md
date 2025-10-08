# ShadowWork - Distributed Computing Platform

A browser-based distributed computing orchestrator built with MERN stack + WebSockets.

## Problem

We waste a ton of compute power — idle laptops, desktops, even phones.
Imagine a system that turns your local network into a mini distributed cloud — where devices share computation for tasks like rendering, compression, or training.

## Idea

- A browser-based distributed compute platform where:

- You submit a “task” (say, compressing 50 files or processing video frames)

- It divides tasks into chunks and distributes them to available devices in your LAN

- Each device returns results; the system aggregates them.

## Features

- Device discovery & real-time connection management
- Task chunking & dynamic distribution
- Parallel task execution across multiple devices
- Fault tolerance & automatic task reassignment
- Real-time dashboard with live updates
- Support for multiple task types (compress, hash, filter, transform)
- Load balancing across worker nodes

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + MongoDB
- **Communication**: Socket.IO (WebSockets)
- **Containerization**: Docker + Docker Compose

## Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │ WebSocket
       ↓
┌─────────────┐      ┌──────────────┐
│   Server    │◄────►│   MongoDB    │
│  (Express)  │      │              │
└──────┬──────┘      └──────────────┘
       │ WebSocket
       ↓
┌─────────────┐
│  Worker 1   │
│  Worker 2   │
│  Worker N   │
└─────────────┘
```

## Author
[anushkaVerma1007](https://github.com/anushkaVerma1007)

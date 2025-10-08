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

## Installation

### Prerequisites

- Node.js 18+
- MongoDB 7.0+
- npm or yarn

### Quick Start (Without Docker)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/shadowwork.git
cd shadowwork
```

2. **Setup Server**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm start
```

3. **Setup Client**
```bash
cd client
npm install
npm run dev
```

4. **Setup Worker(s)**
```bash
cd worker-browser
npm install
npm start
# Run multiple workers in different terminals
```

### Quick Start (With Docker)

```bash
docker-compose up -d
```

Access:
- Client: http://localhost:3000
- Server: http://localhost:5000
- MongoDB: localhost:27017

## Usage

### 1. Start Workers

Run worker agents on different devices:

```bash
cd worker-browser
npm start
```

Or specify custom server URL:

```bash
node src/agent.js http://your-server:5000
```

### 2. Submit Jobs

Open the dashboard at http://localhost:3000

1. Select task type (compress, hash, filter, transform)
2. Enter input data
3. Click "Submit Job"
4. Watch real-time progress as workers process chunks

### 3. Monitor System

Dashboard shows:
- Connected devices and their status
- Active and completed jobs
- Real-time progress bars
- Activity logs

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

## API Endpoints

### REST API

- `POST /api/jobs` - Submit new job
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:jobId` - Get job details
- `GET /api/devices` - Get all devices
- `GET /api/devices/:deviceId` - Get device details

### WebSocket Events

**Client → Server:**
- `register-device` - Register worker device
- `heartbeat` - Send device status
- `task-completed` - Report task completion
- `task-failed` - Report task failure

**Server → Client:**
- `registration-success` - Confirm registration
- `task-assigned` - Assign task to worker
- `device-update` - Broadcast device status
- `job-completed` - Notify job completion

## Testing

### Test Data

Submit a job with this sample data:

```
Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
```

### Expected Behavior

1. Job gets split into multiple chunks
2. Chunks distributed to available workers
3. Workers process in parallel
4. Results aggregated when all chunks complete
5. If worker disconnects, chunks reassigned automatically

## Performance

- Supports 10+ concurrent workers
- Processes 100+ chunks simultaneously
- Sub-second task distribution
- Automatic retry on failure (max 3 attempts)


## Acknowledgments

Built with modern web technologies and distributed systems concepts.
```

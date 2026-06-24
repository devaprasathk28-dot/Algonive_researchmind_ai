# 🤖 Autonomous Scientific Discovery Loop

ResearchMind AI features an autonomous research laboratory loop. It enables automated, end-to-end scientific cycles, ranging from initial hypothesis formulation to training models, deployment, and metacognitive self-learning.

---

## 🔁 The Scientific Cycle

The AGI Research Director manages the coordination between nine core engines, facilitating the flow of research progress:

```
[ AGI Scientific Director ]
           │
           ▼
 [ Hypothesis Engine ] ──► (Identifies research gaps and proposes experiments)
           │
           ▼
[ Experiment Design Engine ] ──► (Selects datasets, variables, and parameters)
           │
           ▼
   [ NAS Search Engine ] ──► (Discovers optimal neural network structures)
           │
           ▼
 [ Training Automation ] ──► (Generates execution pipelines and checkpoints)
           │
           ▼
  [ Deployment Engine ] ──► (Packages models and runs local inference APIs)
           │
           ▼
  [ Self-Learning Core ] ──► (Logs outcomes and updates historical memory)
           │
           ▼
 [ Meta-Reasoning Core ] ──► (Corrects biases and updates the World Model)
```

---

## 🛠️ The Nine Sub-Engines

### 1. AGI Scientific Director
*   **Purpose**: Act as the master governor and scheduler of the scientific lifecycle.
*   **Function**: Breaks down long-term user research goals into executable sequences of micro-tasks. Coordinates resource allocation across the other eight engines.

### 2. Hypothesis Generation Engine
*   **Purpose**: Uncover research gaps and formulate valid research proposals.
*   **Function**: Analyzes indexed collections in ChromaDB, finds unaddressed cross-domain combinations (e.g., applying transformer self-attention to specialized graph structures), and generates testable hypothesis statements.

### 3. Experiment Design Engine
*   **Purpose**: Translate abstract hypothesis statements into concrete blueprint specifications.
*   **Function**: Automatically selects baseline reference models, identifies target evaluation metrics (e.g., accuracy, F1, latency, parameter count), and structures the training parameters matrix.

### 4. Neural Architecture Search (NAS)
*   **Purpose**: Autonomously discover optimal neural network configurations.
*   **Function**: Searches network layers, block selections, kernel dimensions, and activation functions. Evaluates architecture candidates against constraints to export optimal PyTorch structures.

### 5. Training Automation
*   **Purpose**: Execute experiment training pipelines.
*   **Function**: Autonomously writes PyTorch training loops, configures optimization algorithms (AdamW, SGD), sets up learning rate schedulers, and manages checkpointers to save weights on metric improvements.

### 6. Deployment & Scaling Engine
*   **Purpose**: Package and serve trained model architectures.
*   **Function**: Exports network models to standardized formats (ONNX, PyTorch JIT), generates ready-to-run FastAPI microservice containers, sets up basic rate limiters, and configures auto-scaling thresholds.

### 7. Self-Learning Loop
*   **Purpose**: Accumulate adaptation logic from successful and failed runs.
*   **Function**: Maintains a local long-term feedback buffer. If a neural model fails to converge, the self-learning engine logs the failure context to prevent the NAS from picking similar layers in the future.

### 8. Meta-Reasoning & Cognitive Refinement
*   **Purpose**: Filter bias and perform metacognitive validation.
*   **Function**: Analyzes reasoning logs, flags logical loops or potential hallucination patterns, and updates the scientific world model.

### 9. Scientific World Model
*   **Purpose**: Simulates future states and maps scientific trend directions.
*   **Function**: Projects performance curves over time, flags breakthrough predictions, and runs temporal simulations to refine the hypothesis engine's priorities.

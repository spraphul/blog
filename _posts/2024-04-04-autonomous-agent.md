---
title: Building your own Autonomous LLM Agent
---

* TOC
{:toc}

##### In this blog, we are going to talk about LLM-based autonomous agents. Unlike the typical LLMs we're accustomed to, which primarily focus on generating textual content, an autonomous LLM agent transcends this by not only producing responses but also by taking informed actions based on them.

Recently, Cognition Labs released a LLM-based software engineer named Devin. Devin is an LLM-based autonomous agent who can not only answer questions and have conversations with you but also can write codes to files, run them, and deploy them automatically.

In this blog, we'll talk about how to create your own version of Devin or something similar. I'll break down the blog into very fundamental concepts as follows:

## Plan & Tasks

When humans are set with a goal, our immediate instinct is to devise a plan. This plan is essentially a roadmap filled with various tasks that steer us towards our intended destination. Drawing an analogy with the process of developing an autonomous LLM agent, this initial step involves setting a clear objective for the agent, such as defining the goal for Devin (eg., building a sudoku game). Just as we outline a series of steps to reach our goals, the LLM agent needs to come up with a plan with a series of tasks to perform to achieve the goal. These steps function like a guide, instructing the agent on how to achieve its set objectives through the execution of specified tasks. This comparative analysis sheds light on the intricate nature of designing an autonomous LLM agent - showcasing that it’s an entity designed for understanding, planning, and executing tasks toward achieving a predefined goal, much like how humans operate.

I will be referring to an awesome open-source project [OpenDevin](https://github.com/OpenDevin/OpenDevin) for all the code snippets in this blog.

### Task Object

```python
from typing import List

OPEN_STATE = 'open'
COMPLETED_STATE = 'completed'
ABANDONED_STATE = 'abandoned'
IN_PROGRESS_STATE = 'in_progress'
VERIFIED_STATE = 'verified'

STATES = [OPEN_STATE, COMPLETED_STATE,
          ABANDONED_STATE, IN_PROGRESS_STATE, VERIFIED_STATE]

class Task:

    id: str
    goal: str
    parent: "Task | None"
    subtasks: List["Task"]

    def __init__(self, parent: "Task | None", goal: str, state:
                 str=OPEN_STATE, subtasks: List = []):
        """Initializes a new instance of the Task class.

        Args:
            parent: The parent task, or None if it is the root task.
            goal: The goal of the task.
            state: The initial state of the task.
            subtasks: A list of subtasks associated with this task.
        """

        if parent is None:
            self.id = '0'
        else:
            self.id = parent.id + '.' + str(len(parent.subtasks))

        self.parent = parent
        self.goal = goal
        self.subtasks = []

        for subtask in (subtasks or []):
            if isinstance(subtask, Task):
                self.subtasks.append(subtask)
            else:
                goal = subtask.get('goal')
                state = subtask.get('state')
                subtasks = subtask.get('subtasks')
                self.subtasks.append(Task(self, goal, state, subtasks))

        self.state = OPEN_STATE

    def to_string(self, indent=""):
        """Returns a string representation of the task and its
        subtasks.

        Args:
            indent: The indentation string for formatting the output.

        Returns: 
            str: The string representation of the task.
        """

        emoji = ''
        if self.state == VERIFIED_STATE:
            emoji = '✅ '
        elif self.state == COMPLETED_STATE:
            emoji = '🟢 '
        elif self.state == ABANDONED_STATE:
            emoji = '❌ '
        elif self.state == IN_PROGRESS_STATE:
            emoji = '💪 '
        elif self.state == OPEN_STATE:
            emoji = '🔵 '
        result = indent + emoji + ' ' + self.id + ' ' + self.goal + '\n'
        for subtask in self.subtasks:
            result += subtask.to_string(indent + '    ')
        return result

    def to_dict(self):
        """Returns a dictionary representation of the task.

        Returns:
            dict: A dictionary containing the task's attributes.
        """

        return {
            'id': self.id,
            'goal': self.goal,
            'state': self.state,
            'subtasks': [t.to_dict() for t in self.subtasks]
        }

    def set_state(self, state):
        """Sets the state of the task and its subtasks.

        Args:            
            state: The new state of the task.

        Raises:
            ValueError: If the provided state is invalid.
        """

        if state not in STATES:
            raise ValueError('Invalid state:' + state)

        self.state = state

        if state == COMPLETED_STATE or state == \
                ABANDONED_STATE or state == VERIFIED_STATE:
            for subtask in self.subtasks:
                if subtask.state != ABANDONED_STATE:
                    subtask.set_state(state)

        elif state == IN_PROGRESS_STATE:
            if self.parent is not None:
                self.parent.set_state(state)

    def get_current_task(self) -> "Task | None":
        """Retrieves the current task in progress.

        Returns:
            Task | None: The current task in progress, or None if no task is in
            progress.
        """
        for subtask in self.subtasks:
            if subtask.state == IN_PROGRESS_STATE:
                return subtask.get_current_task()

        if self.state == IN_PROGRESS_STATE:
            return self

        return None
```

In this code, we're creating a `Task` class for our autonomous LLM agent. This class helps organize tasks with attributes like `id`, `goal`, `parent`, and `subtasks`. The `__init__` method sets up a task with its ID, goal, and subtasks. Methods like `to_string` create a printable task list, `to_dict` provides a dictionary version of the task, `set_state` changes the task's state, and `get_current_task` finds the task currently in progress. This `Task` class is vital for planning and executing tasks for our LLM agent. Later, we'll use this class to build a similar agent to Devin.

Now let's see what a `Plan` object will look like:

### Plan Object

```python
class Plan:
    """Represents a plan consisting of tasks.

    Attributes:
        main_goal: The main goal of the plan.
        task: The root task of the plan.
    """

    main_goal: str
    task: Task

    def __init__(self, task: str):
        """Initializes a new instance of the Plan class.

        Args:
            task: The main goal of the plan.
        """

        self.main_goal = task
        self.task = Task(parent=None, goal=task, subtasks=[])

    def __str__(self):
        """Returns a string representation of the plan.

        Returns:
            str: A string representation of the plan.
        """

        return self.task.to_string()

    def get_task_by_id(self, id: str) -> Task:
        """Retrieves a task by its ID.

        Args:
            id: The ID of the task.

        Returns:
            Task: The task with the specified ID. 

        Raises:
            ValueError: If the provided task ID is invalid or does not
            exist.
        """

        try:
            parts = [int(p) for p in id.split('.')]
        except ValueError:
            raise ValueError('Invalid task id, non-integer:' + id)

        if parts[0] != 0:
            raise ValueError('Invalid task id, must start with 0:' + id)

        parts = parts[1:]

        task = self.task

        for part in parts:
            if part >= len(task.subtasks):
                raise ValueError('Task does not exist:' + id)
            task = task.subtasks[part]

        return task

    def add_subtask(self, parent_id: str, goal: str, subtasks: List =
                   []):
        """Adds a subtask to a parent task.

        Args:
            parent_id: The ID of the parent task.
            goal: The goal of the subtask.
            subtasks: A list of subtasks associated with the new
            subtask.
        """

        parent = self.get_task_by_id(parent_id)
        child = Task(parent=parent, goal=goal, subtasks=subtasks)
        parent.subtasks.append(child)

    def set_subtask_state(self, id: str, state: str):
        """Sets the state of a subtask.

        Args:
            id: The ID of the subtask.
            state: The new state of the subtask.
        """

        task = self.get_task_by_id(id)
        task.set_state(state)

    def get_current_task(self):
        """Retrieves the current task in progress.

        Returns:
            Task | None: The current task in progress, or None if no task is in
            progress.
        """

        return self.task.get_current_task()
```

This code defines a `Plan` class for our LLM-based agent, organizing tasks into a plan with a main goal. The `Plan` class has attributes like `main_goal` and `task`. The `__init__` method creates a plan with a root task. `__str__` returns a string of the plan's tasks. `get_task_by_id` finds a task by its ID. `add_subtask` adds a new subtask to a task. `set_subtask_state` changes the state of a specific subtask. Finally, `get_current_task` retrieves the task that's currently marked as in progress. This `Plan` class is essential for organizing and tracking tasks.

## Actions and Observations

In our day-to-day lives, when we have a plan in place, the next step involves taking actions. Each action we take is followed by observation; we assess the results of our actions to check if they align with our objectives. Based on this assessment, we either adjust our initial plan or move forward with the next action. This loop of action, observation, and adjustment is pivotal for success. Similarly, autonomous LLM agents operate on this principle. They are designed to take actions based on predefined inputs, observe the outcomes, and evaluate their effectiveness in achieving the desired result, such as generating a suitable response. The agent then decides if it needs to modify its strategy or continue with its current action plan. This process closely mirrors the human methodology of task execution, emphasizing how autonomous LLM agents navigate towards their objectives through a cyclic process of action and reassessment.

Now the next step for us is to define actions for the LLM to take. So, a coding agent can have many possible actions. Some of them can be executable and some non-executable. Actions like "think", "add_task", "modify_task" are non-executable while actions like "read_file", "write_file", "run_code" are executable. We also need to return observations after each running each action.

Let's see what an `Action` & `Observation` Object looks like in this context:

```python
from dataclasses import dataclass, asdict, field

@dataclass
class Action:
    def run(self) -> "Observation":
        raise NotImplementedError

    def to_dict(self):
        d = asdict(self)
        try:
            v = d.pop('action')
        except KeyError:
            raise NotImplementedError(f'{self=} does not have action attribute set')
        return {'action': v, "args": d, "message": self.message}

    @property
    def executable(self) -> bool:
        raise NotImplementedError

    @property
    def message(self) -> str:
        raise NotImplementedError

@dataclass
class Observation:
    """
    This data class represents an observation of the environment. 
    """
    content: str

    def __str__(self) -> str:
        return self.content

    def to_dict(self) -> dict:
        """Converts the observation to a dictionary."""
        extras = copy.deepcopy(self.__dict__)
        content = extras.pop("content", "")
        observation = extras.pop("observation", "")
        return {
            "observation": observation,
            "content": content,
            "extras": extras,
            "message": self.message,
        }

    @property
    def message(self) -> str:
        """Returns a message describing the observation."""
        return ""
```

Now, based on the `action` and `observation` data classes above, we can create custom actions for our LLM agent to perform which return an observation.

Let's create a set of simple actions which writes content to a given file and returns an observation. Along with that we will create a `NullAction` which does nothing, a `ThinkAction` which is an indicator that the model is thinking for a plan, and a `FinishAction` which indicates the model is done with the task.

```python
@dataclass
class ExecutableAction(Action):
    @property
    def executable(self) -> bool:
        return True

@dataclass
class FileWriteAction(ExecutableAction):
    path: str
    content: str
    action: str = "write"

    def run(self) -> FileWriteObservation:
        path = self.path
        with open(path, 'w', encoding='utf-8') as file:
            file.write(self.content)
        return FileWriteObservation(content="", path=self.path)

    @property
    def message(self) -> str:
        return f"Writing file: {self.path}"

@dataclass
class FileWriteObservation(Observation):
    """
    This data class represents a file write operation
    """

    path: str
    observation : str = "write"

    @property
    def message(self) -> str:
        return f"I wrote to the file {self.path}."

@dataclass
class NullAction(NotExecutableAction):
    """An action that does nothing.

    This is used when the agent need to receive user follow-up
    messages from the frontend.
    """

    action: str = "null"

    @property
    def message(self) -> str:
        return "No action"

@dataclass
class NullObservation(Observation):
    """
    This data class represents a null observation.

    This is used when the produced action is NOT executable.
    """

    observation : str = "null"

    @property
    def message(self) -> str:
        return ""

@dataclass
class AgentThinkAction(NotExecutableAction):
    thought: str
    action: str = "think"

    def run(self) -> "Observation":
        raise NotImplementedError

    @property
    def message(self) -> str:
        return self.thought

@dataclass
class AgentFinishAction(NotExecutableAction):
    action: str = "finish"

    def run(self, controller: "AgentController") -> "Observation":
        raise NotImplementedError

    @property
    def message(self) -> str:
        return "Finished"
```

## Memory

As we navigate through various tasks, our memory plays an essential role. It helps us keep track of our achievements, tasks completed, and those that are pending. This capability enables us to have a clear vision of our progress and future course of action. For LLM agents, a similar concept applies. The introduction of what we can term as a 'state manager' acts as the memory for these agents. This state manager records the LLM's progress, items it has successfully accomplished, and those that are yet to be attended to. It maintains a constantly updated log of the agent’s current state, allowing it to make informed decisions about subsequent steps. Just as our memory is crucial for guiding us through tasks efficiently, the state manager ensures the LLM agent remains on the right path toward achieving its set goals, by keeping a detailed track of past actions and their outcomes.

Now, let's create a `State` Object for our LLM Agent.

```python
from dataclasses import dataclass, field

@dataclass
class State:
    plan: Plan
    iteration: int = 0
    history: List[Tuple[Action, Observation]] = \
        field(default_factory=list)
    updated_info: List[Tuple[Action, Observation]] = \
        field(default_factory=list)
```

This code defines a `State` data class for our LLM-based agent. The `State` class represents the state of the agent, including the current plan, iteration number, history of actions and observations, and updated information. As the Agent progresses, we need a mechanism to update this state with all the actions and observations.

## LLM Agent

Now that we have all the essential components for building our Agent, let's create an LLM generation class. I will be using OpenAI's gpt-4 model as the LLM.

```python
import requests
import os
from openai import OpenAI

os.environ["OPENAI_API_KEY"] = <your_openai_key>

class LLM:
    def __init__(self):
        self.client = OpenAI()

    def generate(self, prompt, **kwargs):
        try:
            result = self.client.chat.completions.create(
                model=kwargs.get('model_name',
'gpt-4-0125-preview'),
                messages=[
                    {"role": "system", "content":
                     kwargs.get('sys_prompt',
'You are a helpful AI Assistant.')},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=kwargs.get('max_new_tokens', 1000),
                temperature=kwargs.get('temperature', 0)
            )

            response = result.choices[0].message.content

        except Exception as e:
            print(str(e))
            return

        return response
```

Now, to create an agent out of this LLM, we need a good prompt defining the agent's role and placeholders for different items like plan, history, status etc. Let's create a prompt that instructs the LLM to be a simple blogger who writes a blog and saves it to a file.

```python
prompt = """
# Task

You're an AI blogger. You can't see, draw, or interact with a
browser, but you can write files, and you can think.

You've been given the following task:

%(task)s

## Plan

As you complete this task, you're building a plan and keeping
track of your progress. Here's a JSON representation of your
plan:

%(plan)s

%(plan_status)s

You're responsible for managing this plan and the status of tasks in
it, by using the `add_task` and `modify_task` actions
described below.

If the History below contradicts the state of any of these tasks, you
MUST modify the task using the `modify_task` action
described below.

Be sure NOT to duplicate any tasks. Do NOT use the
`add_task` action for
a task that's already represented. Every task must be
represented only once.

Tasks that are sequential MUST be siblings. They must be
added in order
to their parent task.

If you mark a task as 'completed', 'verified', or 'abandoned',
all non-abandoned subtasks will be marked the same way.
So before closing a task this way, you MUST not only be sure
that it has
been completed successfully--you must ALSO be sure that all
its subtasks
are ready to be marked the same way.

If, and only if, ALL tasks have already been marked verified,
you MUST respond with the `finish` action.

## History

Here is a recent history of actions you've taken in service of this
plan,
as well as observations you've made. This only includes the
MOST RECENT
ten actions--more happened before that.

%(history)s

Your most recent action is at the bottom of that history.

## Action

What is your next thought or action? Your response must be in
JSON format.
It must be an object, and it must contain two fields:

* `action`, which is one of the actions below
* `args`, which is a map of key-value pairs, specifying the
  arguments for that action

* `write` - writes the content to a file. Arguments:
    * `path` - the path of the file to write
    * `content` - the content to write to the file

* `think` - make a plan, set a goal, or record your thoughts.
  Arguments:
    * `thought` - the thought to record

* `add_task` - add a task to your plan. Arguments:
    * `parent` - the ID of the parent task
    * `goal` - the goal of the task
    * `subtasks` - a list of subtasks, each of which is a map with a
      `goal` key.

* `modify_task` - close a task. Arguments:
    * `id` - the ID of the task to close
    * `state` - the new state for this task. It must be one of
      `in_progress` to start working on this task now, `completed`
      to
      mark it as done, `verified` to assert that it was successful, 'abandoned'
      to give up on it permanently, or `open` to stop working on it for
      now.

* `finish` - if ALL of your tasks and subtasks have been verified
  or abanded, and you're absolutely certain that you've
  completed your task and have tested your work, use the finish
  action to stop working.

You MUST take time to think in between read, and write actions.
You should never act twice in a row without thinking. But if your last several
actions are all `think` actions, you should consider taking a
different action.

What is your next thought or action? Again, you must reply with
JSON, and only with JSON.

%(hint)s
"""
```

Now, let's write a function for updating the prompt as the Agent keeps taking action after every step.

```python
def get_prompt(plan: Plan, history: List[Tuple[Action,
                                             Observation]]):
    plan_str = json.dumps(plan.task.to_dict(), indent=2)
    sub_history = history[-HISTORY_SIZE:]
    history_dicts = []
    latest_action: Action = NullAction()
    for action, observation in sub_history:
        if not isinstance(action, NullAction):
            history_dicts.append(action.to_dict())
        latest_action = action
        if not isinstance(observation, NullObservation):
            history_dicts.append(observation.to_dict())
    history_str = json.dumps(history_dicts, indent=2)

    hint = ""

    current_task = plan.get_current_task()

    if current_task is not None:
        plan_status = f"You're currently working on this task:\n{current_task.goal}."
        if len(current_task.subtasks) == 0:
            plan_status += """\nIf it's not achievable AND verifiable with a SINGLE action,
you MUST break it down into subtasks NOW."""
    else:
        plan_status = """You're not currently working on any tasks.
Your next action MUST be to mark a task as in_progress."""

    hint = plan_status

    latest_action_id = latest_action.to_dict()['action']

    if current_task is not None:
        if latest_action_id == "null":
            hint = "You haven't taken any actions yet."
        elif latest_action_id == "write":
            hint = """You just changed a file.
You should think about how it affects your plan."""
        elif latest_action_id == "think":
            hint = """Look at your last thought in the history above.
What does it suggest? Don't think anymore--take action."""
        elif latest_action_id == "add_task":
            hint = "You should think about the next action to take."
        elif latest_action_id == "modify_task":
            hint = "You should think about the next action to take."
        elif latest_action_id == "finish":
            hint = ""

    return prompt % {
        'task': plan.main_goal,
        'plan': plan_str,
        'history': history_str,
        'hint': hint,
        'plan_status': plan_status,
    }
```

This function takes in the plan and the history of actions and observations and builds a real-time prompt for the next action.

Now, we will need some helper functions to convert the model response to an action object. Let's see how we can achieve that. The prompt instructs the model to return a JSON block every time. So we need to implement a JSON parser to convert the model response to a dictionary first and then a helper function to convert the dictionary into an action object.

```python
actions = (
    FileWriteAction,
    AgentThinkAction,
    AddTaskAction,
    ModifyTaskAction,
)

ACTION_TYPE_TO_CLASS = {action_class.action:action_class
                       for action_class in actions}

def action_from_dict(action: dict) -> Action:
    action = action.copy()
    if "action" not in action:
        raise KeyError(f"'action' key is not found in {action=}")
    action_class = ACTION_TYPE_TO_CLASS.get(action["action"])
    if action_class is None:
        raise KeyError(f"'{action['action']=}' is not defined. Available actions: {ACTION_TYPE_TO_CLASS.keys()}")
    args = action.get("args", {})
    return action_class(**args)

def parse_response(response: str) -> Action:
    json_start = response.find("{")
    json_end = response.rfind("}") + 1
    response = response[json_start:json_end]
    action_dict = json.loads(response)
    if 'contents' in action_dict:
        action_dict['content'] = action_dict.pop('contents')
    action = action_from_dict(action_dict)
    return action
```

## Autonomous LLM Agent

Alright! So, we have all the building blocks for running this agent now. Let's write a function to make this Agent work end-to-end.

```python
async def start_loop(task: str, max_iterations: int, llm: LLM):
    finished = False
    plan = Plan(task)
    state = State(plan)

    for i in range(max_iterations):
        try:
            finished = await step(i, llm)
        except Exception as e:
            print("Error in loop", e, flush=True)
            raise e

        if finished:
            break

    if not finished:
        print("Exited before finishing", flush=True)

def update_state_for_step(i):
    state.iteration = i

def update_state_after_step():
    state.updated_info = []

def add_history(action: Action, observation: Observation):
    if not isinstance(action, Action):
        raise ValueError("action must be an instance of Action")
    if not isinstance(observation, Observation):
        raise ValueError("observation must be an instance of Observation")
    state.history.append((action, observation))
    state.updated_info.append((action, observation))

async def step(i: int, llm: LLM):
    print("\n\n==============", flush=True)
    print("STEP", i, flush=True)

    update_state_for_step(i)
    action: Action = NullAction()
    observation: Observation = NullObservation("")

    try:
        pr = get_prompt(state.plan, state.history)
        action_res = llm.generate(pr)
        action = parse_response(action_res)
        if action is None:
            raise ValueError("Agent must return an action")
        print(f"ACTION: {action}")

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return True

    update_state_after_step()

    finished = isinstance(action, AgentFinishAction)

    if finished:
        print(f"INFO: Task Finished")
        return True

    if isinstance(action, AddTaskAction):
        try:
            state.plan.add_subtask(action.parent, action.goal,
                                  action.subtasks)
        except Exception as e:
            print(f"ERROR: {str(e)}")
            return True

    elif isinstance(action, ModifyTaskAction):
        try:
            state.plan.set_subtask_state(action.id, action.state)
        except Exception as e:
            print(f"ERROR: {str(e)}")
            return True

    if action.executable:
        try:
            observation = action.run()

        except Exception as e:
            print(f"ERROR: {str(e)}")
            return True

        if not isinstance(observation, NullObservation):
            print(f"OBSERVATION: {observation}")

        add_history(action, observation)
```

So the long tutorial comes to an end finally. We can start our blogger agent by calling the function as follows:

```python
task = "Write a tutorial blog on Building an Autonomous LLM Agent and save it to a txt file."
llm = LLM()
await start_loop(task=task, max_iterations=30, llm=llm)
```

Once you run the script end-to-end, you will ultimately have your déjà vu moment, and I will leave that up to you to react. 😅

Hit me up with the cool agents you come up with. Until then, Keep learning, Keep Sharing!

## References

* [https://github.com/OpenDevin/OpenDevin](https://github.com/OpenDevin/OpenDevin)
* [https://openai.com/](https://openai.com/)
* [https://www.cognition-labs.com/introducing-devin](https://www.cognition-labs.com/introducing-devin)

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgentInfo, ExecutionPlan, PermissionRequest, PlanStep } from '../types/ide';
import { api } from '../services/api';

interface AgentThought {
  id: string;
  role: string;
  text: string;
  timestamp: number;
}

interface AgentContextType {
  agents: AgentInfo[];
  currentPlan: ExecutionPlan | null;
  thoughts: AgentThought[];
  pendingPermission: PermissionRequest | null;
  isRunning: boolean;
  submitGoal: (goal: string) => Promise<void>;
  executeStep: (stepId: string) => Promise<void>;
  pausePlan: () => Promise<void>;
  resumePlan: () => Promise<void>;
  stopPlan: () => Promise<void>;
  respondPermission: (approved: boolean, alwaysAllow?: boolean) => Promise<void>;
  clearThoughts: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [currentPlan, setCurrentPlan] = useState<ExecutionPlan | null>(null);
  const [thoughts, setThoughts] = useState<AgentThought[]>([]);
  const [pendingPermission, setPendingPermission] = useState<PermissionRequest | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    async function loadAgents() {
      try {
        const list = await api.agents.listAgents();
        setAgents(list);
      } catch (err) {
        console.error('Failed to load agents:', err);
      }
    }
    loadAgents();

    const unsubPlan = api.agents.onPlanUpdate((plan) => {
      setCurrentPlan(plan);
      setIsRunning(plan.status === 'running');
    });

    const unsubThought = api.agents.onAgentThought((thought) => {
      setThoughts((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: thought.role,
          text: thought.text,
          timestamp: Date.now(),
        },
      ]);
    });

    const unsubPerm = api.permissions.onRequest((req) => {
      setPendingPermission(req);
    });

    return () => {
      unsubPlan();
      unsubThought();
      unsubPerm();
    };
  }, []);

  const submitGoal = async (goal: string) => {
    try {
      setIsRunning(true);
      const plan = await api.agents.submitGoal(goal);
      setCurrentPlan(plan);
    } catch (err) {
      console.error('Failed to submit goal:', err);
      setIsRunning(false);
    }
  };

  const executeStep = async (stepId: string) => {
    try {
      await api.agents.runStep(stepId);
    } catch (err) {
      console.error('Failed to execute step:', stepId, err);
    }
  };

  const pausePlan = async () => {
    setIsRunning(false);
  };

  const resumePlan = async () => {
    setIsRunning(true);
  };

  const stopPlan = async () => {
    setIsRunning(false);
  };

  const respondPermission = async (approved: boolean, alwaysAllow?: boolean) => {
    if (!pendingPermission) return;
    try {
      await api.permissions.respond(pendingPermission.id, approved, alwaysAllow);
      setPendingPermission(null);
    } catch (err) {
      console.error('Failed to respond to permission:', err);
    }
  };

  const clearThoughts = () => {
    setThoughts([]);
  };

  return (
    <AgentContext.Provider
      value={{
        agents,
        currentPlan,
        thoughts,
        pendingPermission,
        isRunning,
        submitGoal,
        executeStep,
        pausePlan,
        resumePlan,
        stopPlan,
        respondPermission,
        clearThoughts,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (!context) throw new Error('useAgents must be used within an AgentProvider');
  return context;
};

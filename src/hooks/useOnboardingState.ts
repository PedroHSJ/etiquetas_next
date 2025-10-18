"use client";

import { useState, useEffect } from "react";
import { OnboardingChoice } from "@/types/onboarding";

export interface OnboardingState {
  step: "choice" | "wizard" | "invites" | "completed";
  choice: OnboardingChoice | null;
  organizationData: {
    id: string;
    name: string;
  } | null;
  acceptedInvites: string[];
  isRestored?: boolean; // Indica se foi restaurado do localStorage
}

const ONBOARDING_STORAGE_KEY = "etiquetas_onboarding_state";
const ONBOARDING_EXPIRY_KEY = "etiquetas_onboarding_expiry";
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 horas em milliseconds

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>({
    step: "choice",
    choice: null,
    organizationData: null,
    acceptedInvites: [],
    isRestored: false,
  });

  // Carregar estado do localStorage na inicialização
  useEffect(() => {
    const loadState = () => {
      try {
        const storedState = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        const storedExpiry = localStorage.getItem(ONBOARDING_EXPIRY_KEY);

        if (storedState && storedExpiry) {
          const expiry = parseInt(storedExpiry, 10);
          const now = Date.now();

          // Verificar se não expirou
          if (now < expiry) {
            const parsedState = JSON.parse(storedState) as OnboardingState;
            setState({
              ...parsedState,
              isRestored: parsedState.step !== "choice",
            });
            console.log("Estado do onboarding carregado:", parsedState);
            return;
          } else {
            // Expirado, limpar storage
            localStorage.removeItem(ONBOARDING_STORAGE_KEY);
            localStorage.removeItem(ONBOARDING_EXPIRY_KEY);
            console.log("Estado do onboarding expirado, limpando...");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar estado do onboarding:", error);
        // Em caso de erro, limpar storage corrompido
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
        localStorage.removeItem(ONBOARDING_EXPIRY_KEY);
      }
    };

    loadState();
  }, []);

  // Salvar estado no localStorage sempre que mudança
  useEffect(() => {
    const saveState = () => {
      try {
        const now = Date.now();
        const expiry = now + EXPIRY_TIME;

        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
        localStorage.setItem(ONBOARDING_EXPIRY_KEY, expiry.toString());

        console.log("Estado do onboarding salvo:", state);
      } catch (error) {
        console.error("Erro ao salvar estado do onboarding:", error);
      }
    };

    // Só salvar se não for o estado inicial
    if (state.step !== "choice" || state.choice !== null) {
      saveState();
    }
  }, [state]);

  const setChoice = (choice: OnboardingChoice) => {
    setState((prev) => ({
      ...prev,
      step: choice.tipo === "gestor" ? "wizard" : "choice",
      choice,
    }));
  };

  const setWizardComplete = (orgId: string, orgName: string) => {
    setState((prev) => ({
      ...prev,
      step: "invites",
      organizationData: { id: orgId, name: orgName },
    }));
  };

  const setInvitesComplete = () => {
    setState((prev) => ({
      ...prev,
      step: "completed",
    }));
  };

  const addAcceptedInvite = (inviteId: string) => {
    setState((prev) => ({
      ...prev,
      acceptedInvites: [...prev.acceptedInvites, inviteId],
    }));
  };

  const resetOnboarding = () => {
    setState({
      step: "choice",
      choice: null,
      organizationData: null,
      acceptedInvites: [],
      isRestored: false,
    });

    // Limpar localStorage
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_EXPIRY_KEY);
  };

  const resetToChoice = () => {
    setState((prev) => ({
      ...prev,
      step: "choice",
      choice: null,
    }));
  };

  const resetToWizard = () => {
    setState((prev) => ({
      ...prev,
      step: "wizard",
    }));
  };

  const clearOnboardingState = () => {
    // Função para limpar o estado quando o onboarding for concluído
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_EXPIRY_KEY);
  };

  return {
    state,
    setChoice,
    setWizardComplete,
    setInvitesComplete,
    addAcceptedInvite,
    resetOnboarding,
    resetToChoice,
    resetToWizard,
    clearOnboardingState,
  };
}

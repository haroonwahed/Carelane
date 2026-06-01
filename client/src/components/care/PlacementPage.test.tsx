import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SpaCase } from "../../hooks/useCases";
import type { SpaProvider } from "../../hooks/useProviders";
import { PlacementPage } from "./PlacementPage";

const mockUseCases = vi.fn();
const mockUseProviders = vi.fn();
const mockApiGet = vi.fn();

vi.mock("../../hooks/useCases", () => ({
  useCases: (...args: unknown[]) => mockUseCases(...args),
}));

vi.mock("../../hooks/useProviders", () => ({
  useProviders: (...args: unknown[]) => mockUseProviders(...args),
}));

vi.mock("../../lib/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

function makeCase(overrides: Partial<SpaCase>): SpaCase {
  return {
    id: "C-P1",
    title: "Plaatsingscasus",
    regio: "Utrecht",
    zorgtype: "Jeugdzorg",
    wachttijd: 4,
    status: "plaatsing",
    urgency: "normal",
    problems: [],
    systemInsight: "",
    recommendedAction: "",
    urgencyValidated: true,
    urgencyDocumentPresent: true,
    urgencyGrantedDate: null,
    waitlistBucket: 1,
    intakeStartDate: null,
    arrangementTypeCode: "",
    arrangementProvider: "Zorggroep A",
    arrangementEndDate: null,
    ...overrides,
  };
}

function makeProvider(id: string, name: string): SpaProvider {
  return {
    id,
    name,
    city: "Utrecht",
    status: "active",
    currentCapacity: 3,
    maxCapacity: 12,
    waitingListLength: 1,
    averageWaitDays: 5,
    offersOutpatient: true,
    offersDayTreatment: false,
    offersResidential: false,
    offersCrisis: false,
    serviceArea: "Utrecht",
    specialFacilities: "Jeugd",
    availableSpots: 3,
    region: "Utrecht",
    type: "ambulant",
    specializations: ["Wonen"],
    latitude: 52.09,
    longitude: 5.12,
    hasCoordinates: true,
    locationLabel: "Utrecht",
    regionLabel: "Utrecht",
    municipalityLabel: "Utrecht",
    secondaryRegionLabels: [],
    allRegionLabels: ["Utrecht"],
  };
}

beforeEach(() => {
  mockUseCases.mockReset();
  mockUseProviders.mockReset();
  mockApiGet.mockReset();
});

describe("PlacementPage", () => {
  it("shows taxonomy explainability in the selected provider card", async () => {
    mockApiGet.mockResolvedValue({
      caseId: "C-P1",
      placement: {
        id: "p-1",
        status: "IN_REVIEW",
        providerResponseStatus: "ACCEPTED",
        providerResponseReasonCode: "NONE",
        proposedProviderId: "1",
        selectedProviderId: "1",
        careForm: "OUTPATIENT",
        decisionNotes: "",
        taxonomieLijn: "Taxonomie: Wonen & verblijf → Woonvoorziening",
        taxonomieCodeLijn: "Taxonomiecode: WONEN_VERBLIJF → WONEN_VERBLIJF_WOONVOORZIENING",
      },
    });
    mockUseCases.mockReturnValue({
      cases: [makeCase({ id: "C-P1" })],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseProviders.mockReturnValue({
      providers: [makeProvider("1", "Zorggroep A")],
      loading: false,
      error: null,
      totalCount: 1,
      networkSummary: null,
      lastUpdatedAt: Date.now(),
      refetch: vi.fn(),
    });

    render(<PlacementPage caseId="C-P1" providerId="1" onBack={() => {}} onCancel={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Taxonomie: Wonen & verblijf/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Taxonomiecode: WONEN_VERBLIJF/i)).toBeInTheDocument();
  });

  it("shows confirmation errors as a visible alert in the placement dialog", async () => {
    const user = userEvent.setup();
    mockApiGet.mockResolvedValue({
      caseId: "C-P1",
      placement: {
        id: "p-1",
        status: "IN_REVIEW",
        providerResponseStatus: "ACCEPTED",
        providerResponseReasonCode: "NONE",
        proposedProviderId: "1",
        selectedProviderId: "1",
        careForm: "OUTPATIENT",
        decisionNotes: "",
      },
    });
    mockUseCases.mockReturnValue({
      cases: [makeCase({ id: "C-P1" })],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseProviders.mockReturnValue({
      providers: [makeProvider("1", "Zorggroep A")],
      loading: false,
      error: null,
      totalCount: 1,
      networkSummary: null,
      lastUpdatedAt: Date.now(),
      refetch: vi.fn(),
    });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Plaatsing kon niet worden bevestigd."),
    }));

    render(<PlacementPage caseId="C-P1" providerId="1" onBack={() => {}} onCancel={() => {}} />);

    await user.click(await screen.findByRole("button", { name: "Bevestig plaatsing" }));
    await user.click(screen.getByRole("button", { name: "Bevestig" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Je kunt nog niet verder");
    expect(alert).toHaveTextContent("Plaatsing kon niet worden bevestigd.");

    vi.unstubAllGlobals();
  });
});

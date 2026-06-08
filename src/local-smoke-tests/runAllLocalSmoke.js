require("dotenv").config();

const { spawnSync } = require("child_process");

const {
  evaluateDbSafetyGuard,
  PROVIDER_MODE_KEYS,
} = require("../db-safety-tests/dbSafetyGuard");

const SAFE_NODE_ENVS = new Set(["development-local", "test"]);
const SAFE_PROVIDER_MODES = new Set(["mock", "sandbox"]);
const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const DEFAULT_BASE_URL = "http://localhost:4000/api";
const RELATED_FILES = [
  "package.json",
  "README.md",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  "src/local-smoke-tests/promotionClaimSmoke.js",
  "src/local-smoke-tests/gameTransferSmoke.js",
  "src/local-smoke-tests/adminReportsConfigSmoke.js",
  "src/local-smoke-tests/bankModuleSmoke.js",
  "src/local-smoke-tests/adminPermissionSmoke.js",
  "src/local-smoke-tests/adminRoleManagementSmoke.js",
  "src/local-smoke-tests/adminWorkScheduleSmoke.js",
  "src/local-smoke-tests/adminWorkScheduleUiSmoke.js",
  "src/local-smoke-tests/adminAuditSecuritySmoke.js",
  "src/local-smoke-tests/adminWheelUiSmoke.js",
  "src/local-smoke-tests/adminWheelRuntimeSmoke.js",
  "src/local-smoke-tests/adminBrowserRoutesSmoke.js",
  "src/local-smoke-tests/adminBackofficeReadOnlyIntegrationSmoke.js",
  "src/local-smoke-tests/adminGuardedBankAccountReviewSmoke.js",
  "src/local-smoke-tests/adminOperatorHandoffSmoke.js",
  "src/local-smoke-tests/adminBankAccountReviewReleasePackSmoke.js",
  "src/payment-provider-mock/paymentProviderContract.js",
  "src/payment-provider-mock/paymentProviderMockHarness.js",
  "src/local-smoke-tests/paymentProviderContractSmoke.js",
  "src/game-provider-mock/oroplaySeamlessContract.js",
  "src/game-provider-mock/oroplaySeamlessMockHarness.js",
  "src/local-smoke-tests/oroplaySeamlessContractSmoke.js",
  "src/game-provider-mock/oroplayCallbackBoundary.js",
  "src/local-smoke-tests/oroplayCallbackBoundarySmoke.js",
  "src/game-provider-mock/oroplayCallbackStubContract.js",
  "src/controllers/oroplayCallbackStub.controller.js",
  "src/routes/oroplayCallbackStub.routes.js",
  "src/local-smoke-tests/oroplayCallbackStubSmoke.js",
  "src/game-provider-mock/oroplayCallbackReadinessContract.js",
  "src/game-provider-mock/oroplayCallbackReadinessHarness.js",
  "src/local-smoke-tests/oroplayCallbackReadinessSmoke.js",
  "src/game-provider-mock/oroplayCallbackRuntimeSimulator.js",
  "src/game-provider-mock/oroplayCallbackRuntimeScenarios.js",
  "src/local-smoke-tests/oroplayCallbackRuntimeSimulationSmoke.js",
  "src/game-provider-mock/oroplayCallbackRuntimeAdapterContract.js",
  "src/game-provider-mock/oroplayWalletLedgerBridgeDesign.js",
  "src/local-smoke-tests/oroplayCallbackRuntimeAdapterContractSmoke.js",
  "src/game-provider-mock/oroplayCallbackRuntimeExecutionPlan.js",
  "src/game-provider-mock/oroplayCallbackRuntimeGate.js",
  "src/local-smoke-tests/oroplayCallbackRuntimeExecutionPlanSmoke.js",
  "src/game-provider-mock/oroplayCallbackRuntimeReadinessGate.js",
  "src/game-provider-mock/oroplayCallbackPreImplementationCertificationPack.js",
  "src/local-smoke-tests/oroplayCallbackRuntimeReadinessGateSmoke.js",
  "src/game-provider-mock/oroplayCallbackImplementationDesignFreeze.js",
  "src/game-provider-mock/oroplayCallbackStagingActivationPlan.js",
  "src/local-smoke-tests/oroplayCallbackImplementationDesignFreezeSmoke.js",
  "src/game-provider-mock/oroplayCallbackRuntimeDisabledGate.js",
  "src/game-provider-mock/oroplayCallbackRuntimeImplementationSkeleton.js",
  "src/local-smoke-tests/oroplayCallbackRuntimeImplementationSkeletonSmoke.js",
  "src/game-provider-mock/oroplayCallbackStagingWiringPrecheck.js",
  "src/local-smoke-tests/oroplayCallbackStagingWiringPrecheckSmoke.js",
  "src/game-provider-mock/oroplayCallbackRuntimeShadowInvoker.js",
  "src/game-provider-mock/oroplayCallbackRuntimeShadowFixtures.js",
  "src/local-smoke-tests/oroplayCallbackRuntimeShadowInvocationSmoke.js",
  "src/game-provider-mock/oroplayCallbackRequestResponseEnvelope.js",
  "src/game-provider-mock/oroplayCallbackRequestResponseFixtures.js",
  "src/local-smoke-tests/oroplayCallbackRequestResponseEnvelopeSmoke.js",
  "src/game-provider-mock/oroplayCallbackControllerFacadeDryRun.js",
  "src/game-provider-mock/oroplayCallbackControllerFacadeFixtures.js",
  "src/local-smoke-tests/oroplayCallbackControllerFacadeDryRunSmoke.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteWiringDesign.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteWiringFixtures.js",
  "src/local-smoke-tests/oroplayCallbackStagingRouteWiringDesignSmoke.js",
  "src/game-provider-mock/oroplayCallbackStagingRoutePreflight.js",
  "src/game-provider-mock/oroplayCallbackStagingRoutePreflightFixtures.js",
  "src/local-smoke-tests/oroplayCallbackStagingRoutePreflightSmoke.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteDryRunGate.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteDryRunGateFixtures.js",
  "src/local-smoke-tests/oroplayCallbackStagingRouteDryRunGateSmoke.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteInternalShadowHarness.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteInternalShadowHarnessFixtures.js",
  "src/local-smoke-tests/oroplayCallbackStagingRouteInternalShadowHarnessSmoke.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteMountDecisionReadinessGate.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteMountDecisionReadinessGateFixtures.js",
  "src/local-smoke-tests/oroplayCallbackStagingRouteMountDecisionReadinessGateSmoke.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteHumanMountReviewEvidencePack.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteHumanMountReviewEvidencePackFixtures.js",
  "src/local-smoke-tests/oroplayCallbackStagingRouteHumanMountReviewEvidencePackSmoke.js",
  "src/local-smoke-tests/oro4lSmoke.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalIntakeGate.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalIntakeGateFixtures.js",
  "src/local-smoke-tests/oroplayCallbackStagingRouteSignedApprovalIntakeGateSmoke.js",
  "src/local-smoke-tests/oro4nSmoke.js",
  "src/local-smoke-tests/oro4oSmoke.js",
  "src/local-smoke-tests/oro4pSmoke.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteMountAuthorizationHoldGate.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteMountAuthorizationHoldGateFixtures.js",
  "src/local-smoke-tests/oroplayCallbackStagingRouteMountAuthorizationHoldGateSmoke.js",
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_AUTHORIZATION_HOLD_GATE.md",
  "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistry.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistryFixtures.js",
  "src/local-smoke-tests/oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistrySmoke.js",
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_ARTIFACT_PRIVATE_HASH_REGISTRY.md",
  "src/local-smoke-tests/oro4sSmoke.js",
  "src/local-smoke-tests/oro4tSmoke.js",
  "src/local-smoke-tests/oro4uSmoke.js",
  "src/game-provider-mock/oro4vRouteMountApprovalBoundary.js",
  "src/game-provider-mock/oro4vRouteMountApprovalBoundaryFixtures.js",
  "src/local-smoke-tests/oro4vRouteMountApprovalBoundarySmoke.js",
  "src/local-smoke-tests/oro4vSmoke.js",
  "docs/ORO_4V_ROUTE_MOUNT_APPROVAL_BOUNDARY.md",
  "src/game-provider-mock/oro4wRouteMountImplementationApprovalReadiness.js",
  "src/game-provider-mock/oro4wRouteMountImplementationApprovalReadinessFixtures.js",
  "src/local-smoke-tests/oro4wRouteMountImplementationApprovalReadinessSmoke.js",
  "src/local-smoke-tests/oro4wSmoke.js",
  "docs/ORO_4W_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_READINESS.md",
  "src/game-provider-mock/oro4xRouteMountImplementationApprovalDecisionBoundary.js",
  "src/game-provider-mock/oro4xRouteMountImplementationApprovalDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro4xRouteMountImplementationApprovalDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro4xSmoke.js",
  "docs/ORO_4X_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_DECISION_BOUNDARY.md",
  "src/game-provider-mock/oro4yRouteMountExecutionApprovalReadiness.js",
  "src/game-provider-mock/oro4yRouteMountExecutionApprovalReadinessFixtures.js",
  "src/local-smoke-tests/oro4yRouteMountExecutionApprovalReadinessSmoke.js",
  "src/local-smoke-tests/oro4ySmoke.js",
  "docs/ORO_4Y_ROUTE_MOUNT_EXECUTION_APPROVAL_READINESS.md",
  "src/game-provider-mock/oro4zRouteMountPatchReviewDecisionBoundary.js",
  "src/game-provider-mock/oro4zRouteMountPatchReviewDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro4zRouteMountPatchReviewDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro4zSmoke.js",
  "docs/ORO_4Z_ROUTE_MOUNT_PATCH_REVIEW_DECISION_BOUNDARY.md",
  "src/game-provider-mock/oro5aRouteMountExecutionApprovalRequestSubmission.js",
  "src/game-provider-mock/oro5aRouteMountExecutionApprovalRequestSubmissionFixtures.js",
  "src/local-smoke-tests/oro5aRouteMountExecutionApprovalRequestSubmissionSmoke.js",
  "src/local-smoke-tests/oro5aSmoke.js",
  "docs/ORO_5A_ROUTE_MOUNT_EXECUTION_APPROVAL_REQUEST_SUBMISSION.md",
  "src/game-provider-mock/oro5bRouteMountFinalExecutionApprovalDecisionBoundary.js",
  "src/game-provider-mock/oro5bRouteMountFinalExecutionApprovalDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5bRouteMountFinalExecutionApprovalDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro5bSmoke.js",
  "docs/ORO_5B_ROUTE_MOUNT_FINAL_EXECUTION_APPROVAL_DECISION_BOUNDARY.md",
  "src/game-provider-mock/oro5cRouteMountPatchImplementationAuthorizationRequestSubmission.js",
  "src/game-provider-mock/oro5cRouteMountPatchImplementationAuthorizationRequestSubmissionFixtures.js",
  "src/local-smoke-tests/oro5cRouteMountPatchImplementationAuthorizationRequestSubmissionSmoke.js",
  "src/local-smoke-tests/oro5cSmoke.js",
  "docs/ORO_5C_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_SUBMISSION.md",
  "src/game-provider-mock/oro5dRouteMountPatchImplementationAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro5dRouteMountPatchImplementationAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5dRouteMountPatchImplementationAuthorizationDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro5dSmoke.js",
  "docs/ORO_5D_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md",
  "src/game-provider-mock/oro5eActualPatchImplementationApprovalRequestSubmissionBoundary.js",
  "src/game-provider-mock/oro5eActualPatchImplementationApprovalRequestSubmissionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5eActualPatchImplementationApprovalRequestSubmissionBoundarySmoke.js",
  "src/local-smoke-tests/oro5eSmoke.js",
  "docs/ORO_5E_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_SUBMISSION_BOUNDARY.md",
  "src/game-provider-mock/oro5fActualPatchImplementationApprovalDecisionBoundary.js",
  "src/game-provider-mock/oro5fActualPatchImplementationApprovalDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5fActualPatchImplementationApprovalDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro5fSmoke.js",
  "docs/ORO_5F_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_DECISION_BOUNDARY.md",
  "src/game-provider-mock/oro5gActualPatchImplementationAuthorizationRequestBoundary.js",
  "src/game-provider-mock/oro5gActualPatchImplementationAuthorizationRequestBoundaryFixtures.js",
  "src/local-smoke-tests/oro5gActualPatchImplementationAuthorizationRequestBoundarySmoke.js",
  "src/local-smoke-tests/oro5gSmoke.js",
  "docs/ORO_5G_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_BOUNDARY.md",
  "src/game-provider-mock/oro5hActualPatchImplementationAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro5hActualPatchImplementationAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5hActualPatchImplementationAuthorizationDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro5hSmoke.js",
  "docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md",
  "src/game-provider-mock/oro5iActualPatchImplementationExecutionReadinessBoundary.js",
  "src/game-provider-mock/oro5iActualPatchImplementationExecutionReadinessBoundaryFixtures.js",
  "src/local-smoke-tests/oro5iActualPatchImplementationExecutionReadinessBoundarySmoke.js",
  "src/local-smoke-tests/oro5iSmoke.js",
  "docs/ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_BOUNDARY.md",
  "src/game-provider-mock/oro5jActualPatchImplementationExecutionBoundary.js",
  "src/game-provider-mock/oro5jActualPatchImplementationExecutionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5jActualPatchImplementationExecutionBoundarySmoke.js",
  "src/local-smoke-tests/oro5jSmoke.js",
  "docs/ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY.md",
  [
    "src/game-provider-mock/oro5kPostExecutionValidation",
    "RouteMountAuthorizationRequestReadinessBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro5kPostExecutionValidation",
    "RouteMountAuthorizationRequestReadinessBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro5kPostExecutionValidation",
    "RouteMountAuthorizationRequestReadinessBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro5kSmoke.js",
  [
    "docs/ORO_5K_POST_EXECUTION_VALIDATION_",
    "ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
  ].join(""),
  "src/game-provider-mock/oro5lRouteMountAuthorizationRequestSubmissionBoundary.js",
  "src/game-provider-mock/oro5lRouteMountAuthorizationRequestSubmissionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5lRouteMountAuthorizationRequestSubmissionBoundarySmoke.js",
  "src/local-smoke-tests/oro5lSmoke.js",
  "docs/ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md",
  "src/game-provider-mock/oro5mRouteMountAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro5mRouteMountAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5mRouteMountAuthorizationDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro5mSmoke.js",
  "docs/ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md",
  "src/game-provider-mock/oro5nRouteMountImplementationBoundary.js",
  "src/game-provider-mock/oro5nRouteMountImplementationBoundaryFixtures.js",
  "src/local-smoke-tests/oro5nRouteMountImplementationBoundarySmoke.js",
  "src/local-smoke-tests/oro5nSmoke.js",
  "docs/ORO_5N_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY.md",
  "src/game-provider-mock/oro5oPostMountValidationBoundary.js",
  "src/game-provider-mock/oro5oPostMountValidationBoundaryFixtures.js",
  "src/local-smoke-tests/oro5oPostMountValidationBoundarySmoke.js",
  "src/local-smoke-tests/oro5oSmoke.js",
  "docs/ORO_5O_POST_MOUNT_VALIDATION_BOUNDARY.md",
  "src/game-provider-mock/oro5pPostMountValidationDecisionBoundary.js",
  "src/game-provider-mock/oro5pPostMountValidationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5pPostMountValidationDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro5pSmoke.js",
  [
    "docs/ORO_5P_POST_MOUNT_VALIDATION_DECISION_",
    "PUBLIC_ALIAS_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
  ].join(""),
  "src/game-provider-mock/oro5qPublicAliasAuthorizationRequestSubmissionBoundary.js",
  "src/game-provider-mock/oro5qPublicAliasAuthorizationRequestSubmissionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5qPublicAliasAuthorizationRequestSubmissionBoundarySmoke.js",
  "src/local-smoke-tests/oro5qSmoke.js",
  "docs/ORO_5Q_PUBLIC_ALIAS_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md",
  "src/game-provider-mock/oro5rPublicAliasAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro5rPublicAliasAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5rPublicAliasAuthorizationDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro5rSmoke.js",
  "docs/ORO_5R_PUBLIC_ALIAS_AUTHORIZATION_DECISION_BOUNDARY.md",
  "src/game-provider-mock/oro5sPublicAliasImplementationBoundary.js",
  "src/game-provider-mock/oro5sPublicAliasImplementationBoundaryFixtures.js",
  "src/local-smoke-tests/oro5sPublicAliasImplementationBoundarySmoke.js",
  "src/local-smoke-tests/oro5sSmoke.js",
  "docs/ORO_5S_PUBLIC_ALIAS_IMPLEMENTATION_BOUNDARY.md",
  "src/game-provider-mock/oro5tPublicAliasPostImplementationValidationBoundary.js",
  "src/game-provider-mock/oro5tPublicAliasPostImplementationValidationBoundaryFixtures.js",
  "src/local-smoke-tests/oro5tPublicAliasPostImplementationValidationBoundarySmoke.js",
  "src/local-smoke-tests/oro5tSmoke.js",
  "docs/ORO_5T_PUBLIC_ALIAS_POST_IMPLEMENTATION_VALIDATION_BOUNDARY.md",
  "src/game-provider-mock/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundary.js",
  "src/game-provider-mock/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryFixtures.js",
  "src/local-smoke-tests/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundarySmoke.js",
  "src/local-smoke-tests/oro5uSmoke.js",
  "docs/ORO_5U_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
  "src/game-provider-mock/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary.js",
  "src/game-provider-mock/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundarySmoke.js",
  "src/local-smoke-tests/oro5vSmoke.js",
  "docs/ORO_5V_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md",
  "src/game-provider-mock/oro5wRuntimeTrafficAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro5wRuntimeTrafficAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5wRuntimeTrafficAuthorizationDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro5wSmoke.js",
  "docs/ORO_5W_RUNTIME_TRAFFIC_AUTHORIZATION_DECISION_BOUNDARY.md",
  "src/game-provider-mock/oro5xRuntimeTrafficEnablementBoundary.js",
  "src/game-provider-mock/oro5xRuntimeTrafficEnablementBoundaryFixtures.js",
  "src/local-smoke-tests/oro5xRuntimeTrafficEnablementBoundarySmoke.js",
  "src/local-smoke-tests/oro5xSmoke.js",
  "docs/ORO_5X_RUNTIME_TRAFFIC_ENABLEMENT_BOUNDARY.md",
  "src/game-provider-mock/oro5yRuntimeTrafficPostEnablementValidationBoundary.js",
  "src/game-provider-mock/oro5yRuntimeTrafficPostEnablementValidationBoundaryFixtures.js",
  "src/local-smoke-tests/oro5yRuntimeTrafficPostEnablementValidationBoundarySmoke.js",
  "src/local-smoke-tests/oro5ySmoke.js",
  "docs/ORO_5Y_RUNTIME_TRAFFIC_POST_ENABLEMENT_VALIDATION_BOUNDARY.md",
  "src/game-provider-mock/oro5zLiveTrafficAuthorizationRequestBoundary.js",
  "src/game-provider-mock/oro5zLiveTrafficAuthorizationRequestBoundaryFixtures.js",
  "src/local-smoke-tests/oro5zLiveTrafficAuthorizationRequestBoundarySmoke.js",
  "src/local-smoke-tests/oro5zSmoke.js",
  "docs/ORO_5Z_LIVE_TRAFFIC_AUTHORIZATION_REQUEST_BOUNDARY.md",
  "src/game-provider-mock/oro6aLiveTrafficAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro6aLiveTrafficAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro6aLiveTrafficAuthorizationDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro6aSmoke.js",
  "docs/ORO_6A_LIVE_TRAFFIC_AUTHORIZATION_DECISION_BOUNDARY.md",
  "src/game-provider-mock/oro6bLiveTrafficEnablementReadinessBoundary.js",
  "src/game-provider-mock/oro6bLiveTrafficEnablementReadinessBoundaryFixtures.js",
  "src/local-smoke-tests/oro6bLiveTrafficEnablementReadinessBoundarySmoke.js",
  "src/local-smoke-tests/oro6bSmoke.js",
  "docs/ORO_6B_LIVE_TRAFFIC_ENABLEMENT_READINESS_BOUNDARY.md",
  "src/game-provider-mock/oro6cLiveTrafficEnablementBoundary.js",
  "src/game-provider-mock/oro6cLiveTrafficEnablementBoundaryFixtures.js",
  "src/local-smoke-tests/oro6cLiveTrafficEnablementBoundarySmoke.js",
  "src/local-smoke-tests/oro6cSmoke.js",
  "docs/ORO_6C_LIVE_TRAFFIC_ENABLEMENT_BOUNDARY.md",
  "src/game-provider-mock/oro6dLiveTrafficPostEnablementValidationBoundary.js",
  "src/game-provider-mock/oro6dLiveTrafficPostEnablementValidationBoundaryFixtures.js",
  "src/local-smoke-tests/oro6dLiveTrafficPostEnablementValidationBoundarySmoke.js",
  "src/local-smoke-tests/oro6dSmoke.js",
  "docs/ORO_6D_LIVE_TRAFFIC_POST_ENABLEMENT_VALIDATION_BOUNDARY.md",
  "src/game-provider-mock/oro6eLiveTrafficExternalCallAuthorizationRequestBoundary.js",
  "src/game-provider-mock/oro6eLiveTrafficExternalCallAuthorizationRequestBoundaryFixtures.js",
  "src/local-smoke-tests/oro6eLiveTrafficExternalCallAuthorizationRequestBoundarySmoke.js",
  "src/local-smoke-tests/oro6eSmoke.js",
  "docs/ORO_6E_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_REQUEST_BOUNDARY.md",
  "src/game-provider-mock/oro6fLiveTrafficExternalCallAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro6fLiveTrafficExternalCallAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro6fLiveTrafficExternalCallAuthorizationDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro6fSmoke.js",
  "docs/ORO_6F_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_DECISION_BOUNDARY.md",
  "src/game-provider-mock/oro6gLiveTrafficExternalCallReadinessGate.js",
  "src/game-provider-mock/oro6gLiveTrafficExternalCallReadinessGateFixtures.js",
  "src/local-smoke-tests/oro6gLiveTrafficExternalCallReadinessGateSmoke.js",
  "src/local-smoke-tests/oro6gSmoke.js",
  "docs/ORO_6G_LIVE_TRAFFIC_EXTERNAL_CALL_READINESS_GATE.md",
  "src/game-provider-mock/oro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary.js",
  "src/game-provider-mock/oro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundaryFixtures.js",
  "src/local-smoke-tests/oro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundarySmoke.js",
  "src/local-smoke-tests/oro6hSmoke.js",
  "docs/ORO_6H_LIVE_TRAFFIC_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md",
  "src/game-provider-mock/oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro6iSmoke.js",
  "docs/ORO_6I_LIVE_TRAFFIC_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md",
  "src/game-provider-mock/oro6jLiveTrafficExternalCallPreExecutionReadinessGate.js",
  "src/game-provider-mock/oro6jLiveTrafficExternalCallPreExecutionReadinessGateFixtures.js",
  "src/local-smoke-tests/oro6jLiveTrafficExternalCallPreExecutionReadinessGateSmoke.js",
  "src/local-smoke-tests/oro6jSmoke.js",
  "docs/ORO_6J_LIVE_TRAFFIC_EXTERNAL_CALL_PRE_EXECUTION_READINESS_GATE.md",
  "src/game-provider-mock/oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary.js",
  "src/game-provider-mock/oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures.js",
  "src/local-smoke-tests/oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundarySmoke.js",
  "src/local-smoke-tests/oro6kSmoke.js",
  [
    "docs/ORO_6K_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md",
  ].join("_"),
  "src/game-provider-mock/oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary.js",
  [
    "src/game-provider-mock/oro6lLiveTrafficActualExternalCallExecution",
    "AuthorizationDecisionBoundaryFixtures.js",
  ].join(""),
  "src/local-smoke-tests/oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundarySmoke.js",
  "src/local-smoke-tests/oro6lSmoke.js",
  [
    "docs/ORO_6L_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6mLiveTrafficActualExternalCall",
    "ExecutionReadinessGate.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6mLiveTrafficActualExternalCall",
    "ExecutionReadinessGateFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6mLiveTrafficActualExternalCall",
    "ExecutionReadinessGateSmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6mSmoke.js",
  [
    "docs/ORO_6M_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_READINESS_GATE.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6nLiveTrafficActualExternalCall",
    "ExecutionEnablementRequestBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6nLiveTrafficActualExternalCall",
    "ExecutionEnablementRequestBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6nLiveTrafficActualExternalCall",
    "ExecutionEnablementRequestBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6nSmoke.js",
  [
    "docs/ORO_6N_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ENABLEMENT_REQUEST_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6oLiveTrafficActualExternalCall",
    "ExecutionEnablementDecisionBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6oLiveTrafficActualExternalCall",
    "ExecutionEnablementDecisionBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6oLiveTrafficActualExternalCall",
    "ExecutionEnablementDecisionBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6oSmoke.js",
  [
    "docs/ORO_6O_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ENABLEMENT_DECISION_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6pLiveTrafficActualExternalCall",
    "ExecutionFinalReadinessGate.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6pLiveTrafficActualExternalCall",
    "ExecutionFinalReadinessGateFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6pLiveTrafficActualExternalCall",
    "ExecutionFinalReadinessGateSmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6pSmoke.js",
  [
    "docs/ORO_6P_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_FINAL_READINESS_GATE.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6qLiveTrafficActualExternalCall",
    "ExecutionRuntimeEnablementRequestBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6qLiveTrafficActualExternalCall",
    "ExecutionRuntimeEnablementRequestBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6qLiveTrafficActualExternalCall",
    "ExecutionRuntimeEnablementRequestBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6qSmoke.js",
  [
    "docs/ORO_6Q_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ENABLEMENT_REQUEST_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6rLiveTrafficActualExternalCall",
    "ExecutionRuntimeEnablementDecisionBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6rLiveTrafficActualExternalCall",
    "ExecutionRuntimeEnablementDecisionBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6rLiveTrafficActualExternalCall",
    "ExecutionRuntimeEnablementDecisionBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6rSmoke.js",
  [
    "docs/ORO_6R_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ENABLEMENT_DECISION_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6sLiveTrafficActualExternalCall",
    "ExecutionRuntimeFinalReadinessGate.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6sLiveTrafficActualExternalCall",
    "ExecutionRuntimeFinalReadinessGateFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6sLiveTrafficActualExternalCall",
    "ExecutionRuntimeFinalReadinessGateSmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6sSmoke.js",
  [
    "docs/ORO_6S_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_FINAL_READINESS_GATE.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6tLiveTrafficActualExternalCall",
    "ExecutionActivationRequestBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6tLiveTrafficActualExternalCall",
    "ExecutionActivationRequestBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6tLiveTrafficActualExternalCall",
    "ExecutionActivationRequestBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6tSmoke.js",
  [
    "docs/ORO_6T_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ACTIVATION_REQUEST_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6uLiveTrafficActualExternalCall",
    "ExecutionActivationDecisionBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6uLiveTrafficActualExternalCall",
    "ExecutionActivationDecisionBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6uLiveTrafficActualExternalCall",
    "ExecutionActivationDecisionBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6uSmoke.js",
  [
    "docs/ORO_6U_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ACTIVATION_DECISION_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6vLiveTrafficActualExternalCall",
    "ExecutionActivationFinalReadinessGate.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6vLiveTrafficActualExternalCall",
    "ExecutionActivationFinalReadinessGateFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6vLiveTrafficActualExternalCall",
    "ExecutionActivationFinalReadinessGateSmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6vSmoke.js",
  [
    "docs/ORO_6V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ACTIVATION_FINAL_READINESS_GATE.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6wLiveTrafficActualExternalCall",
    "ExecutionLiveExecutionRequestBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6wLiveTrafficActualExternalCall",
    "ExecutionLiveExecutionRequestBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6wLiveTrafficActualExternalCall",
    "ExecutionLiveExecutionRequestBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6wSmoke.js",
  [
    "docs/ORO_6W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_LIVE_EXECUTION_REQUEST_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6xLiveTrafficActualExternalCall",
    "ExecutionLiveExecutionDecisionBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6xLiveTrafficActualExternalCall",
    "ExecutionLiveExecutionDecisionBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6xLiveTrafficActualExternalCall",
    "ExecutionLiveExecutionDecisionBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6xSmoke.js",
  [
    "docs/ORO_6X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_LIVE_EXECUTION_DECISION_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6yLiveTrafficActualExternalCall",
    "ExecutionLiveExecutionFinalReadinessGate.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6yLiveTrafficActualExternalCall",
    "ExecutionLiveExecutionFinalReadinessGateFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6yLiveTrafficActualExternalCall",
    "ExecutionLiveExecutionFinalReadinessGateSmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6ySmoke.js",
  [
    "docs/ORO_6Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_LIVE_EXECUTION_FINAL_READINESS_GATE.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro6zLiveTrafficActualExternalCall",
    "ExecutionFinalExecutionRequestBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro6zLiveTrafficActualExternalCall",
    "ExecutionFinalExecutionRequestBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro6zLiveTrafficActualExternalCall",
    "ExecutionFinalExecutionRequestBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro6zSmoke.js",
  [
    "docs/ORO_6Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_FINAL_EXECUTION_REQUEST_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro7aLiveTrafficActualExternalCall",
    "ExecutionFinalExecutionDecisionBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro7aLiveTrafficActualExternalCall",
    "ExecutionFinalExecutionDecisionBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro7aLiveTrafficActualExternalCall",
    "ExecutionFinalExecutionDecisionBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro7aSmoke.js",
  [
    "docs/ORO_7A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_FINAL_EXECUTION_DECISION_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro7bLiveTrafficActualExternalCall",
    "ExecutionAuthorizationRequestBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro7bLiveTrafficActualExternalCall",
    "ExecutionAuthorizationRequestBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro7bLiveTrafficActualExternalCall",
    "ExecutionAuthorizationRequestBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro7bSmoke.js",
  [
    "docs/ORO_7B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro7cLiveTrafficActualExternalCall",
    "ExecutionAuthorizationDecisionBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro7cLiveTrafficActualExternalCall",
    "ExecutionAuthorizationDecisionBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro7cLiveTrafficActualExternalCall",
    "ExecutionAuthorizationDecisionBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro7cSmoke.js",
  [
    "docs/ORO_7C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro7dLiveTrafficActualExternalCall",
    "ExecutionActivationRequestBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro7dLiveTrafficActualExternalCall",
    "ExecutionActivationRequestBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro7dLiveTrafficActualExternalCall",
    "ExecutionActivationRequestBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro7dSmoke.js",
  [
    "docs/ORO_7D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ACTIVATION_REQUEST_BOUNDARY.md",
  ].join("_"),
  [
    "src/game-provider-mock/oro7eLiveTrafficActualExternalCall",
    "ExecutionActivationDecisionBoundary.js",
  ].join(""),
  [
    "src/game-provider-mock/oro7eLiveTrafficActualExternalCall",
    "ExecutionActivationDecisionBoundaryFixtures.js",
  ].join(""),
  [
    "src/local-smoke-tests/oro7eLiveTrafficActualExternalCall",
    "ExecutionActivationDecisionBoundarySmoke.js",
  ].join(""),
  "src/local-smoke-tests/oro7eSmoke.js",
  [
    "docs/ORO_7E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ACTIVATION_DECISION_BOUNDARY.md",
  ].join("_"),
  "src/payment-provider-mock/memberQrDepositUxContract.js",
  "src/payment-provider-mock/memberQrDepositMockHarness.js",
  "src/local-smoke-tests/memberQrDepositUxSmoke.js",
  "src/payment-provider-mock/depositVerificationSourceContract.js",
  "src/payment-provider-mock/depositVerificationSourceMockHarness.js",
  "src/local-smoke-tests/depositVerificationSourceSmoke.js",
  "src/ledger-mock/depositLedgerReconciliationGuard.js",
  "src/ledger-mock/depositLedgerReconciliationGuardHarness.js",
  "src/local-smoke-tests/depositLedgerReconciliationGuardSmoke.js",
  "src/sandbox-integration/sandboxIntegrationReadinessContract.js",
  "src/sandbox-integration/sandboxIntegrationReadinessHarness.js",
  "src/local-smoke-tests/sandboxIntegrationReadinessSmoke.js",
  "src/local-smoke-tests/stagingReleaseReadinessSmoke.js",
  "src/local-smoke-tests/stagingDeployReadinessPackSmoke.js",
  "src/local-smoke-tests/disposableStagingDbDryRunPackSmoke.js",
  "src/local-smoke-tests/disposableStagingDbPreflightSmoke.js",
  "src/local-smoke-tests/disposableStagingDbPreflightRuntimeHarnessSmoke.js",
  "src/local-smoke-tests/disposableStagingDbPreflightRuntimeHarness.js",
  "src/staging-scripts/disposableStagingDbPreflight.js",
  "src/staging-scripts/disposableStagingDbReadOnlyProbe.js",
  "src/local-smoke-tests/disposableStagingDbReadOnlyProbeSmoke.js",
  "src/local-smoke-tests/disposableStagingDbReadOnlyProbeRuntimeHarnessSmoke.js",
  "src/local-smoke-tests/disposableStagingDbReadOnlyProbeRuntimeHarness.js",
  "src/local-smoke-tests/projectCloseoutSmoke.js",
  "src/local-smoke-tests/productionReadinessAuditSmoke.js",
  "src/local-smoke-tests/productionSafetyDryRunSmoke.js",
  "src/local-smoke-tests/monitoringBackupRunbookSmoke.js",
  "src/local-smoke-tests/financialLedgerHardeningSmoke.js",
  "src/local-smoke-tests/financialLedgerRuntimeContractSmoke.js",
  "src/local-smoke-tests/financialLedgerSchemaDryRunSmoke.js",
  "src/local-smoke-tests/financialLedgerMockRuntimeHarnessSmoke.js",
  "src/local-smoke-tests/financialLedgerReconciliationMockReportsSmoke.js",
  "src/local-smoke-tests/financialLedgerLiveIntegrationCertificationSmoke.js",
  "src/local-smoke-tests/financialLedgerStagingDryRunMigrationSmoke.js",
  "src/local-smoke-tests/masterSpecMappingSmoke.js",
  "src/ledger-mock/financialLedgerMockHarness.js",
  "src/ledger-mock/financialLedgerReconciliationMockReports.js",
  "src/admin-reconciliation-readonly-ui/index.html",
  "src/admin-reconciliation-readonly-ui/app.js",
  "src/admin-reconciliation-readonly-ui/style.css",
  "src/local-smoke-tests/wheelSmoke.js",
  "docs/PRODUCTION_READINESS_GAP_AUDIT.md",
  "docs/PRODUCTION_SAFETY_DRY_RUN.md",
  "docs/MONITORING_BACKUP_RUNBOOK.md",
  "docs/FINANCIAL_LEDGER_HARDENING_PLAN.md",
  "docs/FINANCIAL_LEDGER_RUNTIME_DATA_CONTRACT.md",
  "docs/FINANCIAL_LEDGER_SCHEMA_DRY_RUN_PLAN.md",
  "docs/FINANCIAL_LEDGER_MOCK_RUNTIME_HARNESS.md",
  "docs/FINANCIAL_LEDGER_RECONCILIATION_MOCK_REPORTS.md",
  "docs/FINANCIAL_LEDGER_LIVE_INTEGRATION_CERTIFICATION_CHECKLIST.md",
  "docs/LUCKY_WHEEL_E2E_LOCAL_RUNBOOK.md",
  "docs/PROJECT_CLOSEOUT.md",
  "docs/LUCKY_WHEEL_FINAL_UAT.md",
  "docs/ADMIN_OPERATOR_HANDOFF.md",
  "docs/MASTER_BACKOFFICE_SPEC.md",
  "docs/MASTER_FRONTEND_MEMBER_SPEC.md",
  "docs/API_MAPPING.md",
  "docs/PERMISSION_MATRIX.md",
  "docs/AUDIT_LOG_MATRIX.md",
  "docs/PHASE_ROADMAP.md",
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/OROPLAY_SEAMLESS_WALLET_CONTRACT.md",
  "docs/OROPLAY_CALLBACK_API_DESIGN.md",
  "docs/OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT.md",
  "docs/OROPLAY_CALLBACK_RUNTIME_READINESS_GATE.md",
  "docs/OROPLAY_CALLBACK_PRE_IMPLEMENTATION_CERTIFICATION.md",
  "docs/OROPLAY_CALLBACK_IMPLEMENTATION_DESIGN_FREEZE.md",
  "docs/OROPLAY_CALLBACK_STAGING_ONLY_ACTIVATION_PLAN.md",
  "docs/OROPLAY_CALLBACK_RUNTIME_IMPLEMENTATION_SKELETON.md",
  "docs/OROPLAY_CALLBACK_STAGING_DISABLED_RUNTIME_GATE.md",
  "docs/OROPLAY_CALLBACK_RUNTIME_SKELETON_CERTIFICATION.md",
  "docs/OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK.md",
  "docs/OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION.md",
  "docs/OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE.md",
  "docs/OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN.md",
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN.md",
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_PREFLIGHT.md",
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_DRY_RUN_GATE.md",
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_INTERNAL_SHADOW_HARNESS.md",
  "docs/SMOKE_COVERAGE.md",
  "docs/MEMBER_QR_DEPOSIT_UX_CONTRACT.md",
  "docs/MEMBER_QR_DEPOSIT_MOCK_UAT_CHECKLIST.md",
  "docs/DEPOSIT_VERIFICATION_SOURCE_MOCK_HARNESS.md",
  "docs/DEPOSIT_VERIFICATION_SOURCE_MOCK_UAT_CHECKLIST.md",
  "docs/DEPOSIT_LEDGER_RECONCILIATION_GUARD.md",
  "docs/DEPOSIT_LEDGER_RECONCILIATION_GUARD_UAT_CHECKLIST.md",
  "docs/STAGING_DEPLOY_READINESS_PACK.md",
  "docs/STAGING_ENVIRONMENT_MATRIX.md",
  "docs/STAGING_DEPLOY_GO_NO_GO.md",
  "docs/DISPOSABLE_STAGING_DB_DRY_RUN.md",
  "docs/DISPOSABLE_STAGING_DB_PREFLIGHT.md",
  "docs/DISPOSABLE_STAGING_DB_PREFLIGHT_RUNTIME_HARNESS.md",
  "docs/DISPOSABLE_STAGING_DB_READ_ONLY_PROBE.md",
  "docs/STAGING_DB_SAFETY_EVIDENCE_CHECKLIST.md",
  "docs/PHASE_AB_GO_NO_GO.md",
  "src/admin-wheel-ui/index.html",
  "src/admin-wheel-ui/app.js",
  "src/admin-wheel-ui/styles.css",
  "src/local-smoke-tests/stagingPreflight.js",
  "src/local-smoke-tests/stagingSmoke.js",
];
const SECRET_GREP_PATTERN = [
  ["postgres", "ql://[^:@]+:[^@]+@"].join(""),
  [["Be", "arer"].join(""), String.raw`\s+`].join(""),
  ["e", "y", "J"].join(""),
  ["s", "k", "-"].join(""),
  ["DATABASE", "_URL", String.raw`\s*=`].join(""),
].join("|");

const nodeCommand = process.execPath;
const npmCommand = process.platform === "win32" ? "cmd.exe" : "npm";

function npmArgs(args) {
  if (process.platform !== "win32") return args;
  return ["/d", "/s", "/c", ["npm", ...args].join(" ")];
}

const summary = [
  { key: "syntax", label: "syntax checks", status: "PENDING" },
  { key: "project", label: "project check", status: "PENDING" },
  { key: "promotion", label: "promotion-claim", status: "PENDING" },
  { key: "money", label: "money-flow", status: "PENDING" },
  { key: "core", label: "core-api", status: "PENDING" },
  { key: "gameTransfer", label: "game-transfer", status: "PENDING" },
  { key: "financial", label: "financial-negative", status: "PENDING" },
  { key: "adminReportsConfig", label: "admin-reports-config", status: "PENDING" },
  { key: "bankModule", label: "bank-module", status: "PENDING" },
  { key: "adminPermission", label: "admin-permission", status: "PENDING" },
  { key: "adminRoleManagement", label: "admin-role-management", status: "PENDING" },
  { key: "adminWorkSchedule", label: "admin-work-schedule", status: "PENDING" },
  { key: "adminWorkScheduleUi", label: "admin-work-schedule-ui", status: "PENDING" },
  { key: "adminAuditSecurity", label: "admin-audit-security", status: "PENDING" },
  { key: "adminWheelUi", label: "admin-wheel-ui", status: "PENDING" },
  { key: "adminWheelRuntime", label: "admin-wheel-runtime", status: "PENDING" },
  { key: "adminBrowserRoutes", label: "admin-browser-routes", status: "PENDING" },
  { key: "adminBackofficeReadOnlyIntegration", label: "admin-backoffice-read-only-integration", status: "PENDING" },
  { key: "adminGuardedBankAccountReview", label: "admin-guarded-bank-account-review", status: "PENDING" },
  { key: "adminOperatorHandoff", label: "admin-operator-handoff", status: "PENDING" },
  { key: "adminBankAccountReviewReleasePack", label: "admin-bank-account-review-release-pack", status: "PENDING" },
  { key: "paymentProviderContract", label: "payment-provider-contract", status: "PENDING" },
  { key: "oroplaySeamlessContract", label: "oroplay-seamless-contract", status: "PENDING" },
  { key: "oroplayCallbackBoundary", label: "oroplay-callback-boundary", status: "PENDING" },
  { key: "oroplayCallbackStub", label: "oroplay-callback-stub", status: "PENDING" },
  { key: "oroplayCallbackReadiness", label: "oroplay-callback-readiness", status: "PENDING" },
  { key: "oroplayCallbackRuntimeSimulation", label: "oroplay-callback-runtime-simulation", status: "PENDING" },
  {
    key: "oroplayCallbackRuntimeAdapterContract",
    label: "oroplay-callback-runtime-adapter-contract",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackRuntimeExecutionPlan",
    label: "oroplay-callback-runtime-execution-plan",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackRuntimeReadinessGate",
    label: "oroplay-callback-runtime-readiness-gate",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackImplementationDesignFreeze",
    label: "oroplay-callback-implementation-design-freeze",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackRuntimeImplementationSkeleton",
    label: "oroplay-callback-runtime-implementation-skeleton",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackStagingWiringPrecheck",
    label: "oroplay-callback-staging-wiring-precheck",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackRuntimeShadowInvocation",
    label: "oroplay-callback-runtime-shadow-invocation",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackRequestResponseEnvelope",
    label: "oroplay-callback-request-response-envelope",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackControllerFacadeDryRun",
    label: "oroplay-callback-controller-facade-dry-run",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackStagingRouteWiringDesign",
    label: "oroplay-callback-staging-route-wiring-design",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackStagingRoutePreflight",
    label: "oroplay-callback-staging-route-preflight",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackStagingRouteDryRunGate",
    label: "oroplay-callback-staging-route-dry-run-gate",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackStagingRouteInternalShadowHarness",
    label: "oroplay-callback-staging-route-internal-shadow-harness",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackStagingRouteMountDecisionReadinessGate",
    label: "oroplay-callback-staging-route-mount-decision-readiness-gate",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackStagingRouteHumanMountReviewEvidencePack",
    label: "oroplay-callback-staging-route-human-mount-review-evidence-pack",
    status: "PENDING",
  },
  { key: "oro4l", label: "oro-4l", status: "PENDING" },
  {
    key: "oroplayCallbackStagingRouteSignedApprovalIntakeGate",
    label: "oroplay-callback-staging-route-signed-approval-intake-gate",
    status: "PENDING",
  },
  { key: "oro4n", label: "oro-4n", status: "PENDING" },
  { key: "oro4o", label: "oro-4o", status: "PENDING" },
  { key: "oro4p", label: "oro-4p", status: "PENDING" },
  {
    key: "oroplayCallbackStagingRouteMountAuthorizationHoldGate",
    label: "oroplay-callback-staging-route-mount-authorization-hold-gate",
    status: "PENDING",
  },
  {
    key: "oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistry",
    label: "oroplay-callback-staging-route-signed-approval-artifact-private-hash-registry",
    status: "PENDING",
  },
  { key: "oro4s", label: "oro-4s", status: "PENDING" },
  { key: "oro4t", label: "oro-4t", status: "PENDING" },
  { key: "oro4v", label: "oro-4v", status: "PENDING" },
  { key: "oro4w", label: "oro-4w", status: "PENDING" },
  { key: "oro4x", label: "oro-4x", status: "PENDING" },
  { key: "oro4y", label: "oro-4y", status: "PENDING" },
  { key: "oro4z", label: "oro-4z", status: "PENDING" },
  { key: "oro5a", label: "oro-5a", status: "PENDING" },
  { key: "oro5b", label: "oro-5b", status: "PENDING" },
  { key: "oro5c", label: "oro-5c", status: "PENDING" },
  { key: "oro5d", label: "oro-5d", status: "PENDING" },
  { key: "oro5e", label: "oro-5e", status: "PENDING" },
  { key: "oro5f", label: "oro-5f", status: "PENDING" },
  { key: "oro5g", label: "oro-5g", status: "PENDING" },
  { key: "oro5h", label: "oro-5h", status: "PENDING" },
  { key: "oro5i", label: "oro-5i", status: "PENDING" },
  { key: "oro5j", label: "oro-5j", status: "PENDING" },
  { key: "oro5k", label: "oro-5k", status: "PENDING" },
  { key: "oro5l", label: "oro-5l", status: "PENDING" },
  { key: "oro5m", label: "oro-5m", status: "PENDING" },
  { key: "oro5n", label: "oro-5n", status: "PENDING" },
  { key: "oro5o", label: "oro-5o", status: "PENDING" },
  { key: "oro5p", label: "oro-5p", status: "PENDING" },
  { key: "oro5q", label: "oro-5q", status: "PENDING" },
  { key: "oro5r", label: "oro-5r", status: "PENDING" },
  { key: "oro5s", label: "oro-5s", status: "PENDING" },
  { key: "oro5t", label: "oro-5t", status: "PENDING" },
  { key: "oro5u", label: "oro-5u", status: "PENDING" },
  { key: "oro5v", label: "oro-5v", status: "PENDING" },
  { key: "oro5w", label: "oro-5w", status: "PENDING" },
  { key: "oro5x", label: "oro-5x", status: "PENDING" },
  { key: "oro5y", label: "oro-5y", status: "PENDING" },
  { key: "oro5z", label: "oro-5z", status: "PENDING" },
  { key: "oro6a", label: "oro-6a", status: "PENDING" },
  { key: "oro6b", label: "oro-6b", status: "PENDING" },
  { key: "oro6c", label: "oro-6c", status: "PENDING" },
  { key: "oro6d", label: "oro-6d", status: "PENDING" },
  { key: "oro6e", label: "oro-6e", status: "PENDING" },
  { key: "oro6f", label: "oro-6f", status: "PENDING" },
  { key: "oro6g", label: "oro-6g", status: "PENDING" },
  { key: "oro6h", label: "oro-6h", status: "PENDING" },
  { key: "oro6i", label: "oro-6i", status: "PENDING" },
  { key: "oro6j", label: "oro-6j", status: "PENDING" },
  { key: "oro6k", label: "oro-6k", status: "PENDING" },
  { key: "oro6l", label: "oro-6l", status: "PENDING" },
  { key: "oro6m", label: "oro-6m", status: "PENDING" },
  { key: "oro6n", label: "oro-6n", status: "PENDING" },
  { key: "oro6o", label: "oro-6o", status: "PENDING" },
  { key: "oro6p", label: "oro-6p", status: "PENDING" },
  { key: "oro6q", label: "oro-6q", status: "PENDING" },
  { key: "oro6r", label: "oro-6r", status: "PENDING" },
  { key: "oro6s", label: "oro-6s", status: "PENDING" },
  { key: "oro6t", label: "oro-6t", status: "PENDING" },
  { key: "oro6u", label: "oro-6u", status: "PENDING" },
  { key: "oro6v", label: "oro-6v", status: "PENDING" },
  { key: "oro6w", label: "oro-6w", status: "PENDING" },
  { key: "oro6x", label: "oro-6x", status: "PENDING" },
  { key: "oro6y", label: "oro-6y", status: "PENDING" },
  { key: "oro6z", label: "oro-6z", status: "PENDING" },
  { key: "oro7a", label: "oro-7a", status: "PENDING" },
  { key: "oro7b", label: "oro-7b", status: "PENDING" },
  { key: "oro7c", label: "oro-7c", status: "PENDING" },
  { key: "oro7d", label: "oro-7d", status: "PENDING" },
  { key: "oro7e", label: "oro-7e", status: "PENDING" },
  { key: "memberQrDepositUx", label: "member-qr-deposit-ux", status: "PENDING" },
  { key: "depositVerificationSource", label: "deposit-verification-source", status: "PENDING" },
  {
    key: "depositLedgerReconciliationGuard",
    label: "deposit-ledger-reconciliation-guard",
    status: "PENDING",
  },
  {
    key: "sandboxIntegrationReadiness",
    label: "sandbox-integration-readiness",
    status: "PENDING",
  },
  { key: "stagingReleaseReadiness", label: "staging-release-readiness", status: "PENDING" },
  { key: "stagingDeployReadinessPack", label: "staging-deploy-readiness-pack", status: "PENDING" },
  {
    key: "disposableStagingDbDryRunPack",
    label: "disposable-staging-db-dry-run-pack",
    status: "PENDING",
  },
  {
    key: "disposableStagingDbPreflight",
    label: "disposable-staging-db-preflight",
    status: "PENDING",
  },
  {
    key: "disposableStagingDbPreflightRuntimeStatic",
    label: "disposable-staging-db-preflight-runtime-static",
    status: "PENDING",
  },
  {
    key: "disposableStagingDbPreflightRuntime",
    label: "disposable-staging-db-preflight-runtime",
    status: "PENDING",
  },
  {
    key: "disposableStagingDbReadOnlyProbeStatic",
    label: "disposable-staging-db-read-only-probe-static",
    status: "PENDING",
  },
  {
    key: "disposableStagingDbReadOnlyProbeRuntimeStatic",
    label: "disposable-staging-db-read-only-probe-runtime-static",
    status: "PENDING",
  },
  {
    key: "disposableStagingDbReadOnlyProbeRuntime",
    label: "disposable-staging-db-read-only-probe-runtime",
    status: "PENDING",
  },
  { key: "productionReadinessAudit", label: "production-readiness-audit", status: "PENDING" },
  { key: "productionSafetyDryRun", label: "production-safety-dry-run", status: "PENDING" },
  { key: "monitoringBackupRunbook", label: "monitoring-backup-runbook", status: "PENDING" },
  { key: "financialLedgerHardening", label: "financial-ledger-hardening", status: "PENDING" },
  { key: "financialLedgerRuntimeContract", label: "financial-ledger-runtime-contract", status: "PENDING" },
  { key: "financialLedgerSchemaDryRun", label: "financial-ledger-schema-dry-run", status: "PENDING" },
  { key: "financialLedgerMockRuntimeHarness", label: "financial-ledger-mock-runtime-harness", status: "PENDING" },
  {
    key: "financialLedgerReconciliationMockReports",
    label: "financial-ledger-reconciliation-mock-reports",
    status: "PENDING",
  },
  {
    key: "financialLedgerLiveIntegrationCertification",
    label: "financial-ledger-live-integration-certification",
    status: "PENDING",
  },
  {
    key: "financialLedgerStagingDryRunMigration",
    label: "financial-ledger-staging-dry-run-migration",
    status: "PENDING",
  },
  { key: "masterSpecMapping", label: "master-spec-mapping", status: "PENDING" },
  { key: "wheel", label: "wheel", status: "PENDING" },
  { key: "projectCloseout", label: "project-closeout", status: "PENDING" },
  { key: "responseScan", label: "response leak scan", status: "PENDING" },
  { key: "secretGrep", label: "secret grep", status: "PENDING" },
  { key: "diff", label: "git diff --check", status: "PENDING" },
];

const steps = [
  {
    name: "node --check promotionClaimSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/promotionClaimSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check moneyFlowSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/moneyFlowSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check coreApiSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/coreApiSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check gameTransferSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/gameTransferSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialNegativeSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialNegativeSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminReportsConfigSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminReportsConfigSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check bankModuleSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/bankModuleSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminPermissionSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminPermissionSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminRoleManagementSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminRoleManagementSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminWorkScheduleSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminWorkScheduleSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminWorkScheduleUiSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminWorkScheduleUiSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminAuditSecuritySmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminAuditSecuritySmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminWheelUiSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminWheelUiSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminWheelRuntimeSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminWheelRuntimeSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminBrowserRoutesSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminBrowserRoutesSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminBackofficeReadOnlyIntegrationSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminBackofficeReadOnlyIntegrationSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminGuardedBankAccountReviewSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminGuardedBankAccountReviewSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminOperatorHandoffSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminOperatorHandoffSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminBankAccountReviewReleasePackSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminBankAccountReviewReleasePackSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check paymentProviderContract",
    command: nodeCommand,
    args: ["--check", "src/payment-provider-mock/paymentProviderContract.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check paymentProviderMockHarness",
    command: nodeCommand,
    args: ["--check", "src/payment-provider-mock/paymentProviderMockHarness.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check paymentProviderContractSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/paymentProviderContractSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplaySeamlessContract",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplaySeamlessContract.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplaySeamlessMockHarness",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplaySeamlessMockHarness.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplaySeamlessContractSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplaySeamlessContractSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackBoundary",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackBoundary.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackBoundarySmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackBoundarySmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStubContract",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStubContract.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStubController",
    command: nodeCommand,
    args: ["--check", "src/controllers/oroplayCallbackStub.controller.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStubRoutes",
    command: nodeCommand,
    args: ["--check", "src/routes/oroplayCallbackStub.routes.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStubSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackStubSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackReadinessContract",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackReadinessContract.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackReadinessHarness",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackReadinessHarness.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackReadinessSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackReadinessSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeSimulator",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackRuntimeSimulator.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeScenarios",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackRuntimeScenarios.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeSimulationSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackRuntimeSimulationSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeAdapterContract",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackRuntimeAdapterContract.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayWalletLedgerBridgeDesign",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayWalletLedgerBridgeDesign.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeAdapterContractSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackRuntimeAdapterContractSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeExecutionPlan",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackRuntimeExecutionPlan.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeGate",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackRuntimeGate.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeExecutionPlanSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackRuntimeExecutionPlanSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeReadinessGate",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackRuntimeReadinessGate.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackPreImplementationCertificationPack",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackPreImplementationCertificationPack.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeReadinessGateSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackRuntimeReadinessGateSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackImplementationDesignFreeze",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackImplementationDesignFreeze.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingActivationPlan",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingActivationPlan.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackImplementationDesignFreezeSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackImplementationDesignFreezeSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeDisabledGate",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackRuntimeDisabledGate.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeImplementationSkeleton",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackRuntimeImplementationSkeleton.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeImplementationSkeletonSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackRuntimeImplementationSkeletonSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingWiringPrecheck",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingWiringPrecheck.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingWiringPrecheckSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackStagingWiringPrecheckSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeShadowInvoker",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackRuntimeShadowInvoker.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeShadowFixtures",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackRuntimeShadowFixtures.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRuntimeShadowInvocationSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackRuntimeShadowInvocationSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRequestResponseEnvelope",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackRequestResponseEnvelope.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRequestResponseFixtures",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackRequestResponseFixtures.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackRequestResponseEnvelopeSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackRequestResponseEnvelopeSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackControllerFacadeDryRun",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackControllerFacadeDryRun.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackControllerFacadeFixtures",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackControllerFacadeFixtures.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackControllerFacadeDryRunSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackControllerFacadeDryRunSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteWiringDesign",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteWiringDesign.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteWiringFixtures",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteWiringFixtures.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteWiringDesignSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackStagingRouteWiringDesignSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRoutePreflight",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRoutePreflight.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRoutePreflightFixtures",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRoutePreflightFixtures.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRoutePreflightSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackStagingRoutePreflightSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteDryRunGate",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteDryRunGate.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteDryRunGateFixtures",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteDryRunGateFixtures.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteDryRunGateSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackStagingRouteDryRunGateSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteInternalShadowHarness",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteInternalShadowHarness.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteInternalShadowHarnessFixtures",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteInternalShadowHarnessFixtures.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteInternalShadowHarnessSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackStagingRouteInternalShadowHarnessSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteMountDecisionReadinessGate",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteMountDecisionReadinessGate.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteMountDecisionReadinessGateFixtures",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteMountDecisionReadinessGateFixtures.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteMountDecisionReadinessGateSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackStagingRouteMountDecisionReadinessGateSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteHumanMountReviewEvidencePack",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteHumanMountReviewEvidencePack.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteHumanMountReviewEvidencePackFixtures",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteHumanMountReviewEvidencePackFixtures.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteHumanMountReviewEvidencePackSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackStagingRouteHumanMountReviewEvidencePackSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro4lSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro4lSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteSignedApprovalIntakeGate",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalIntakeGate.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteSignedApprovalIntakeGateFixtures",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalIntakeGateFixtures.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteSignedApprovalIntakeGateSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackStagingRouteSignedApprovalIntakeGateSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro4nSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro4nSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro4oSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro4oSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro4pSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro4pSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteMountAuthorizationHoldGate",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteMountAuthorizationHoldGate.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteMountAuthorizationHoldGateFixtures",
    command: nodeCommand,
    args: ["--check", "src/game-provider-mock/oroplayCallbackStagingRouteMountAuthorizationHoldGateFixtures.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteMountAuthorizationHoldGateSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oroplayCallbackStagingRouteMountAuthorizationHoldGateSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistry",
    command: nodeCommand,
    args: [
      "--check",
      "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistry.js",
    ],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistryFixtures",
    command: nodeCommand,
    args: [
      "--check",
      "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistryFixtures.js",
    ],
    summaryKey: "syntax",
  },
  {
    name: "node --check oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistrySmoke",
    command: nodeCommand,
    args: [
      "--check",
      "src/local-smoke-tests/oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistrySmoke.js",
    ],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro4sSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro4sSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro4tSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro4tSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro4vSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro4vSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro4wSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro4wSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro4xSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro4xSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro4ySmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro4ySmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro4zSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro4zSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5aSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5aSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5bSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5bSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5cSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5cSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5dSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5dSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5eSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5eSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5fSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5fSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5gSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5gSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5hSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5hSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5iSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5iSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5jSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5jSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5kSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5kSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5lSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5lSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5mSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5mSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5nSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5nSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5oSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5oSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5pSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5pSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5qSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5qSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5rSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5rSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5sSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5sSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5tSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5tSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5uSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5uSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5vSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5vSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5wSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5wSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5xSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5xSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5ySmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5ySmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro5zSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro5zSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6aSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6aSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6bSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6bSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6cSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6cSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6dSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6dSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6eSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6eSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6fSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6fSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6gSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6gSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6hSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6hSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6iSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6iSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6jSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6jSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6kSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6kSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6lSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6lSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6mSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6mSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6nSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6nSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6oSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6oSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6pSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6pSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6qSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6qSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6rSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6rSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6sSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6sSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6tSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6tSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6uSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6uSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6vSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6vSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6wSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6wSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6xSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6xSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6ySmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6ySmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro6zSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro6zSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro7aSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro7aSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro7bSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro7bSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro7cSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro7cSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro7dSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro7dSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check oro7eSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/oro7eSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check memberQrDepositUxContract",
    command: nodeCommand,
    args: ["--check", "src/payment-provider-mock/memberQrDepositUxContract.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check memberQrDepositMockHarness",
    command: nodeCommand,
    args: ["--check", "src/payment-provider-mock/memberQrDepositMockHarness.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check memberQrDepositUxSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/memberQrDepositUxSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check depositVerificationSourceContract",
    command: nodeCommand,
    args: ["--check", "src/payment-provider-mock/depositVerificationSourceContract.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check depositVerificationSourceMockHarness",
    command: nodeCommand,
    args: ["--check", "src/payment-provider-mock/depositVerificationSourceMockHarness.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check depositVerificationSourceSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/depositVerificationSourceSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check depositLedgerReconciliationGuard",
    command: nodeCommand,
    args: ["--check", "src/ledger-mock/depositLedgerReconciliationGuard.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check depositLedgerReconciliationGuardHarness",
    command: nodeCommand,
    args: ["--check", "src/ledger-mock/depositLedgerReconciliationGuardHarness.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check depositLedgerReconciliationGuardSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/depositLedgerReconciliationGuardSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check sandboxIntegrationReadinessContract",
    command: nodeCommand,
    args: ["--check", "src/sandbox-integration/sandboxIntegrationReadinessContract.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check sandboxIntegrationReadinessHarness",
    command: nodeCommand,
    args: ["--check", "src/sandbox-integration/sandboxIntegrationReadinessHarness.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check sandboxIntegrationReadinessSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/sandboxIntegrationReadinessSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check stagingReleaseReadinessSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/stagingReleaseReadinessSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check stagingDeployReadinessPackSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/stagingDeployReadinessPackSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check disposableStagingDbDryRunPackSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/disposableStagingDbDryRunPackSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check disposableStagingDbPreflight",
    command: nodeCommand,
    args: ["--check", "src/staging-scripts/disposableStagingDbPreflight.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check disposableStagingDbPreflightSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/disposableStagingDbPreflightSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check disposableStagingDbPreflightRuntimeHarnessSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/disposableStagingDbPreflightRuntimeHarnessSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check disposableStagingDbPreflightRuntimeHarness",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/disposableStagingDbPreflightRuntimeHarness.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check disposableStagingDbReadOnlyProbe",
    command: nodeCommand,
    args: ["--check", "src/staging-scripts/disposableStagingDbReadOnlyProbe.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check disposableStagingDbReadOnlyProbeSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/disposableStagingDbReadOnlyProbeSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check disposableStagingDbReadOnlyProbeRuntimeHarnessSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/disposableStagingDbReadOnlyProbeRuntimeHarnessSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check disposableStagingDbReadOnlyProbeRuntimeHarness",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/disposableStagingDbReadOnlyProbeRuntimeHarness.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check productionReadinessAuditSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/productionReadinessAuditSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check productionSafetyDryRunSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/productionSafetyDryRunSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check monitoringBackupRunbookSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/monitoringBackupRunbookSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerHardeningSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerHardeningSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerRuntimeContractSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerRuntimeContractSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerSchemaDryRunSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerSchemaDryRunSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerMockHarness",
    command: nodeCommand,
    args: ["--check", "src/ledger-mock/financialLedgerMockHarness.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerMockRuntimeHarnessSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerMockRuntimeHarnessSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerReconciliationMockReports",
    command: nodeCommand,
    args: ["--check", "src/ledger-mock/financialLedgerReconciliationMockReports.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check admin reconciliation readonly UI app",
    command: nodeCommand,
    args: ["--check", "src/admin-reconciliation-readonly-ui/app.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerReconciliationMockReportsSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerReconciliationMockReportsSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerLiveIntegrationCertificationSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerLiveIntegrationCertificationSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerStagingDryRunMigrationSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerStagingDryRunMigrationSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check masterSpecMappingSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/masterSpecMappingSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check wheelSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/wheelSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check projectCloseoutSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/projectCloseoutSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check stagingPreflight",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/stagingPreflight.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check stagingSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/stagingSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "npm run check",
    command: npmCommand,
    args: npmArgs(["run", "check"]),
    summaryKey: "project",
  },
  {
    name: "npm run smoke:promotion-claim",
    command: npmCommand,
    args: npmArgs(["run", "smoke:promotion-claim"]),
    summaryKey: "promotion",
  },
  {
    name: "npm run smoke:money-flow",
    command: npmCommand,
    args: npmArgs(["run", "smoke:money-flow"]),
    summaryKey: "money",
  },
  {
    name: "npm run smoke:core-api",
    command: npmCommand,
    args: npmArgs(["run", "smoke:core-api"]),
    summaryKey: "core",
  },
  {
    name: "npm run smoke:game-transfer",
    command: npmCommand,
    args: npmArgs(["run", "smoke:game-transfer"]),
    summaryKey: "gameTransfer",
  },
  {
    name: "npm run smoke:financial-negative",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-negative"]),
    summaryKey: "financial",
  },
  {
    name: "npm run smoke:admin-reports-config",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-reports-config"]),
    summaryKey: "adminReportsConfig",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:bank-module",
    command: npmCommand,
    args: npmArgs(["run", "smoke:bank-module"]),
    summaryKey: "bankModule",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-permission",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-permission"]),
    summaryKey: "adminPermission",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-role-management",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-role-management"]),
    summaryKey: "adminRoleManagement",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-work-schedule",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-work-schedule"]),
    summaryKey: "adminWorkSchedule",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-work-schedule-ui",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-work-schedule-ui"]),
    summaryKey: "adminWorkScheduleUi",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-audit-security",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-audit-security"]),
    summaryKey: "adminAuditSecurity",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-wheel-ui",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-wheel-ui"]),
    summaryKey: "adminWheelUi",
  },
  {
    name: "npm run smoke:admin-wheel-runtime",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-wheel-runtime"]),
    summaryKey: "adminWheelRuntime",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-browser-routes",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-browser-routes"]),
    summaryKey: "adminBrowserRoutes",
  },
  {
    name: "npm run smoke:admin-backoffice-read-only-integration",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-backoffice-read-only-integration"]),
    summaryKey: "adminBackofficeReadOnlyIntegration",
  },
  {
    name: "npm run smoke:admin-guarded-bank-account-review",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-guarded-bank-account-review"]),
    summaryKey: "adminGuardedBankAccountReview",
  },
  {
    name: "npm run smoke:admin-operator-handoff",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-operator-handoff"]),
    summaryKey: "adminOperatorHandoff",
  },
  {
    name: "npm run smoke:admin-bank-account-review-release-pack",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-bank-account-review-release-pack"]),
    summaryKey: "adminBankAccountReviewReleasePack",
  },
  {
    name: "npm run smoke:payment-provider-contract",
    command: npmCommand,
    args: npmArgs(["run", "smoke:payment-provider-contract"]),
    summaryKey: "paymentProviderContract",
  },
  {
    name: "npm run smoke:oroplay-seamless-contract",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-seamless-contract"]),
    summaryKey: "oroplaySeamlessContract",
  },
  {
    name: "npm run smoke:oroplay-callback-boundary",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-boundary"]),
    summaryKey: "oroplayCallbackBoundary",
  },
  {
    name: "npm run smoke:oroplay-callback-stub",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-stub"]),
    summaryKey: "oroplayCallbackStub",
  },
  {
    name: "npm run smoke:oroplay-callback-readiness",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-readiness"]),
    summaryKey: "oroplayCallbackReadiness",
  },
  {
    name: "npm run smoke:oroplay-callback-runtime-simulation",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-runtime-simulation"]),
    summaryKey: "oroplayCallbackRuntimeSimulation",
  },
  {
    name: "npm run smoke:oroplay-callback-runtime-adapter-contract",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-runtime-adapter-contract"]),
    summaryKey: "oroplayCallbackRuntimeAdapterContract",
  },
  {
    name: "npm run smoke:oroplay-callback-runtime-execution-plan",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-runtime-execution-plan"]),
    summaryKey: "oroplayCallbackRuntimeExecutionPlan",
  },
  {
    name: "npm run smoke:oroplay-callback-runtime-readiness-gate",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-runtime-readiness-gate"]),
    summaryKey: "oroplayCallbackRuntimeReadinessGate",
  },
  {
    name: "npm run smoke:oroplay-callback-implementation-design-freeze",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-implementation-design-freeze"]),
    summaryKey: "oroplayCallbackImplementationDesignFreeze",
  },
  {
    name: "npm run smoke:oroplay-callback-runtime-implementation-skeleton",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-runtime-implementation-skeleton"]),
    summaryKey: "oroplayCallbackRuntimeImplementationSkeleton",
  },
  {
    name: "npm run smoke:oroplay-callback-staging-wiring-precheck",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-staging-wiring-precheck"]),
    summaryKey: "oroplayCallbackStagingWiringPrecheck",
  },
  {
    name: "npm run smoke:oroplay-callback-runtime-shadow-invocation",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-runtime-shadow-invocation"]),
    summaryKey: "oroplayCallbackRuntimeShadowInvocation",
  },
  {
    name: "npm run smoke:oroplay-callback-request-response-envelope",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-request-response-envelope"]),
    summaryKey: "oroplayCallbackRequestResponseEnvelope",
  },
  {
    name: "npm run smoke:oroplay-callback-controller-facade-dry-run",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-controller-facade-dry-run"]),
    summaryKey: "oroplayCallbackControllerFacadeDryRun",
  },
  {
    name: "npm run smoke:oroplay-callback-staging-route-wiring-design",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-staging-route-wiring-design"]),
    summaryKey: "oroplayCallbackStagingRouteWiringDesign",
  },
  {
    name: "npm run smoke:oroplay-callback-staging-route-preflight",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-staging-route-preflight"]),
    summaryKey: "oroplayCallbackStagingRoutePreflight",
  },
  {
    name: "npm run smoke:oroplay-callback-staging-route-dry-run-gate",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-staging-route-dry-run-gate"]),
    summaryKey: "oroplayCallbackStagingRouteDryRunGate",
  },
  {
    name: "npm run smoke:oroplay-callback-staging-route-internal-shadow-harness",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-staging-route-internal-shadow-harness"]),
    summaryKey: "oroplayCallbackStagingRouteInternalShadowHarness",
  },
  {
    name: "npm run smoke:oroplay-callback-staging-route-mount-decision-readiness-gate",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-staging-route-mount-decision-readiness-gate"]),
    summaryKey: "oroplayCallbackStagingRouteMountDecisionReadinessGate",
  },
  {
    name: "npm run smoke:oroplay-callback-staging-route-human-mount-review-evidence-pack",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-staging-route-human-mount-review-evidence-pack"]),
    summaryKey: "oroplayCallbackStagingRouteHumanMountReviewEvidencePack",
  },
  {
    name: "npm run smoke:oro-4l",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-4l"]),
    summaryKey: "oro4l",
  },
  {
    name: "npm run smoke:oroplay-callback-staging-route-signed-approval-intake-gate",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-staging-route-signed-approval-intake-gate"]),
    summaryKey: "oroplayCallbackStagingRouteSignedApprovalIntakeGate",
  },
  {
    name: "npm run smoke:oro-4n",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-4n"]),
    summaryKey: "oro4n",
  },
  {
    name: "npm run smoke:oro-4o",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-4o"]),
    summaryKey: "oro4o",
  },
  {
    name: "npm run smoke:oro-4p",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-4p"]),
    summaryKey: "oro4p",
  },
  {
    name: "npm run smoke:oroplay-callback-staging-route-mount-authorization-hold-gate",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oroplay-callback-staging-route-mount-authorization-hold-gate"]),
    summaryKey: "oroplayCallbackStagingRouteMountAuthorizationHoldGate",
  },
  {
    name: "npm run smoke:oroplay-callback-staging-route-signed-approval-artifact-private-hash-registry",
    command: npmCommand,
    args: npmArgs([
      "run",
      "smoke:oroplay-callback-staging-route-signed-approval-artifact-private-hash-registry",
    ]),
    summaryKey: "oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistry",
  },
  {
    name: "npm run smoke:oro-4s",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-4s"]),
    summaryKey: "oro4s",
  },
  {
    name: "npm run smoke:oro-4t",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-4t"]),
    summaryKey: "oro4t",
  },
  {
    name: "npm run smoke:oro-4u",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-4u"]),
    summaryKey: "oro4u",
  },
  {
    name: "npm run smoke:oro-4v",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-4v"]),
    summaryKey: "oro4v",
  },
  {
    name: "npm run smoke:oro-4w",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-4w"]),
    summaryKey: "oro4w",
  },
  {
    name: "npm run smoke:oro-4x",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-4x"]),
    summaryKey: "oro4x",
  },
  {
    name: "npm run smoke:oro-4y",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-4y"]),
    summaryKey: "oro4y",
  },
  {
    name: "npm run smoke:oro-4z",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-4z"]),
    summaryKey: "oro4z",
  },
  {
    name: "npm run smoke:oro-5a",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5a"]),
    summaryKey: "oro5a",
  },
  {
    name: "npm run smoke:oro-5b",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5b"]),
    summaryKey: "oro5b",
  },
  {
    name: "npm run smoke:oro-5c",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5c"]),
    summaryKey: "oro5c",
  },
  {
    name: "npm run smoke:oro-5d",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5d"]),
    summaryKey: "oro5d",
  },
  {
    name: "npm run smoke:oro-5e",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5e"]),
    summaryKey: "oro5e",
  },
  {
    name: "npm run smoke:oro-5f",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5f"]),
    summaryKey: "oro5f",
  },
  {
    name: "npm run smoke:oro-5g",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5g"]),
    summaryKey: "oro5g",
  },
  {
    name: "npm run smoke:oro-5h",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5h"]),
    summaryKey: "oro5h",
  },
  {
    name: "npm run smoke:oro-5i",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5i"]),
    summaryKey: "oro5i",
  },
  {
    name: "npm run smoke:oro-5j",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5j"]),
    summaryKey: "oro5j",
  },
  {
    name: "npm run smoke:oro-5k",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5k"]),
    summaryKey: "oro5k",
  },
  {
    name: "npm run smoke:oro-5l",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5l"]),
    summaryKey: "oro5l",
  },
  {
    name: "npm run smoke:oro-5m",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5m"]),
    summaryKey: "oro5m",
  },
  {
    name: "npm run smoke:oro-5n",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5n"]),
    summaryKey: "oro5n",
  },
  {
    name: "npm run smoke:oro-5o",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5o"]),
    summaryKey: "oro5o",
  },
  {
    name: "npm run smoke:oro-5p",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5p"]),
    summaryKey: "oro5p",
  },
  {
    name: "npm run smoke:oro-5q",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5q"]),
    summaryKey: "oro5q",
  },
  {
    name: "npm run smoke:oro-5r",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5r"]),
    summaryKey: "oro5r",
  },
  {
    name: "npm run smoke:oro-5s",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5s"]),
    summaryKey: "oro5s",
  },
  {
    name: "npm run smoke:oro-5t",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5t"]),
    summaryKey: "oro5t",
  },
  {
    name: "npm run smoke:oro-5u",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5u"]),
    summaryKey: "oro5u",
  },
  {
    name: "npm run smoke:oro-5v",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5v"]),
    summaryKey: "oro5v",
  },
  {
    name: "npm run smoke:oro-5w",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5w"]),
    summaryKey: "oro5w",
  },
  {
    name: "npm run smoke:oro-5x",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5x"]),
    summaryKey: "oro5x",
  },
  {
    name: "npm run smoke:oro-5y",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5y"]),
    summaryKey: "oro5y",
  },
  {
    name: "npm run smoke:oro-5z",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-5z"]),
    summaryKey: "oro5z",
  },
  {
    name: "npm run smoke:oro-6a",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6a"]),
    summaryKey: "oro6a",
  },
  {
    name: "npm run smoke:oro-6b",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6b"]),
    summaryKey: "oro6b",
  },
  {
    name: "npm run smoke:oro-6c",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6c"]),
    summaryKey: "oro6c",
  },
  {
    name: "npm run smoke:oro-6d",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6d"]),
    summaryKey: "oro6d",
  },
  {
    name: "npm run smoke:oro-6e",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6e"]),
    summaryKey: "oro6e",
  },
  {
    name: "npm run smoke:oro-6f",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6f"]),
    summaryKey: "oro6f",
  },
  {
    name: "npm run smoke:oro-6g",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6g"]),
    summaryKey: "oro6g",
  },
  {
    name: "npm run smoke:oro-6h",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6h"]),
    summaryKey: "oro6h",
  },
  {
    name: "npm run smoke:oro-6i",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6i"]),
    summaryKey: "oro6i",
  },
  {
    name: "npm run smoke:oro-6j",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6j"]),
    summaryKey: "oro6j",
  },
  {
    name: "npm run smoke:oro-6k",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6k"]),
    summaryKey: "oro6k",
  },
  {
    name: "npm run smoke:oro-6l",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6l"]),
    summaryKey: "oro6l",
  },
  {
    name: "npm run smoke:oro-6m",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6m"]),
    summaryKey: "oro6m",
  },
  {
    name: "npm run smoke:oro-6n",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6n"]),
    summaryKey: "oro6n",
  },
  {
    name: "npm run smoke:oro-6o",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6o"]),
    summaryKey: "oro6o",
  },
  {
    name: "npm run smoke:oro-6p",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6p"]),
    summaryKey: "oro6p",
  },
  {
    name: "npm run smoke:oro-6q",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6q"]),
    summaryKey: "oro6q",
  },
  {
    name: "npm run smoke:oro-6r",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6r"]),
    summaryKey: "oro6r",
  },
  {
    name: "npm run smoke:oro-6s",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6s"]),
    summaryKey: "oro6s",
  },
  {
    name: "npm run smoke:oro-6t",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6t"]),
    summaryKey: "oro6t",
  },
  {
    name: "npm run smoke:oro-6u",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6u"]),
    summaryKey: "oro6u",
  },
  {
    name: "npm run smoke:oro-6v",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6v"]),
    summaryKey: "oro6v",
  },
  {
    name: "npm run smoke:oro-6w",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6w"]),
    summaryKey: "oro6w",
  },
  {
    name: "npm run smoke:oro-6x",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6x"]),
    summaryKey: "oro6x",
  },
  {
    name: "npm run smoke:oro-6y",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6y"]),
    summaryKey: "oro6y",
  },
  {
    name: "npm run smoke:oro-6z",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-6z"]),
    summaryKey: "oro6z",
  },
  {
    name: "npm run smoke:oro-7a",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-7a"]),
    summaryKey: "oro7a",
  },
  {
    name: "npm run smoke:oro-7b",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-7b"]),
    summaryKey: "oro7b",
  },
  {
    name: "npm run smoke:oro-7c",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-7c"]),
    summaryKey: "oro7c",
  },
  {
    name: "npm run smoke:oro-7d",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-7d"]),
    summaryKey: "oro7d",
  },
  {
    name: "npm run smoke:oro-7e",
    command: npmCommand,
    args: npmArgs(["run", "smoke:oro-7e"]),
    summaryKey: "oro7e",
  },
  {
    name: "npm run smoke:member-qr-deposit-ux",
    command: npmCommand,
    args: npmArgs(["run", "smoke:member-qr-deposit-ux"]),
    summaryKey: "memberQrDepositUx",
  },
  {
    name: "npm run smoke:deposit-verification-source",
    command: npmCommand,
    args: npmArgs(["run", "smoke:deposit-verification-source"]),
    summaryKey: "depositVerificationSource",
  },
  {
    name: "npm run smoke:deposit-ledger-reconciliation-guard",
    command: npmCommand,
    args: npmArgs(["run", "smoke:deposit-ledger-reconciliation-guard"]),
    summaryKey: "depositLedgerReconciliationGuard",
  },
  {
    name: "npm run smoke:sandbox-integration-readiness",
    command: npmCommand,
    args: npmArgs(["run", "smoke:sandbox-integration-readiness"]),
    summaryKey: "sandboxIntegrationReadiness",
  },
  {
    name: "npm run smoke:staging-release-readiness",
    command: npmCommand,
    args: npmArgs(["run", "smoke:staging-release-readiness"]),
    summaryKey: "stagingReleaseReadiness",
  },
  {
    name: "npm run smoke:staging-deploy-readiness-pack",
    command: npmCommand,
    args: npmArgs(["run", "smoke:staging-deploy-readiness-pack"]),
    summaryKey: "stagingDeployReadinessPack",
  },
  {
    name: "npm run smoke:disposable-staging-db-dry-run-pack",
    command: npmCommand,
    args: npmArgs(["run", "smoke:disposable-staging-db-dry-run-pack"]),
    summaryKey: "disposableStagingDbDryRunPack",
  },
  {
    name: "npm run smoke:disposable-staging-db-preflight",
    command: npmCommand,
    args: npmArgs(["run", "smoke:disposable-staging-db-preflight"]),
    summaryKey: "disposableStagingDbPreflight",
  },
  {
    name: "npm run smoke:disposable-staging-db-preflight-runtime-static",
    command: npmCommand,
    args: npmArgs(["run", "smoke:disposable-staging-db-preflight-runtime-static"]),
    summaryKey: "disposableStagingDbPreflightRuntimeStatic",
  },
  {
    name: "npm run smoke:disposable-staging-db-preflight-runtime",
    command: npmCommand,
    args: npmArgs(["run", "smoke:disposable-staging-db-preflight-runtime"]),
    summaryKey: "disposableStagingDbPreflightRuntime",
  },
  {
    name: "npm run smoke:disposable-staging-db-read-only-probe-static",
    command: npmCommand,
    args: npmArgs(["run", "smoke:disposable-staging-db-read-only-probe-static"]),
    summaryKey: "disposableStagingDbReadOnlyProbeStatic",
  },
  {
    name: "npm run smoke:disposable-staging-db-read-only-probe-runtime-static",
    command: npmCommand,
    args: npmArgs(["run", "smoke:disposable-staging-db-read-only-probe-runtime-static"]),
    summaryKey: "disposableStagingDbReadOnlyProbeRuntimeStatic",
  },
  {
    name: "npm run smoke:disposable-staging-db-read-only-probe-runtime",
    command: npmCommand,
    args: npmArgs(["run", "smoke:disposable-staging-db-read-only-probe-runtime"]),
    summaryKey: "disposableStagingDbReadOnlyProbeRuntime",
  },
  {
    name: "npm run smoke:production-readiness-audit",
    command: npmCommand,
    args: npmArgs(["run", "smoke:production-readiness-audit"]),
    summaryKey: "productionReadinessAudit",
  },
  {
    name: "npm run smoke:production-safety-dry-run",
    command: npmCommand,
    args: npmArgs(["run", "smoke:production-safety-dry-run"]),
    summaryKey: "productionSafetyDryRun",
  },
  {
    name: "npm run smoke:monitoring-backup-runbook",
    command: npmCommand,
    args: npmArgs(["run", "smoke:monitoring-backup-runbook"]),
    summaryKey: "monitoringBackupRunbook",
  },
  {
    name: "npm run smoke:financial-ledger-hardening",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-hardening"]),
    summaryKey: "financialLedgerHardening",
  },
  {
    name: "npm run smoke:financial-ledger-runtime-contract",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-runtime-contract"]),
    summaryKey: "financialLedgerRuntimeContract",
  },
  {
    name: "npm run smoke:financial-ledger-schema-dry-run",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-schema-dry-run"]),
    summaryKey: "financialLedgerSchemaDryRun",
  },
  {
    name: "npm run smoke:financial-ledger-mock-runtime-harness",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-mock-runtime-harness"]),
    summaryKey: "financialLedgerMockRuntimeHarness",
  },
  {
    name: "npm run smoke:financial-ledger-reconciliation-mock-reports",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-reconciliation-mock-reports"]),
    summaryKey: "financialLedgerReconciliationMockReports",
  },
  {
    name: "npm run smoke:financial-ledger-live-integration-certification",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-live-integration-certification"]),
    summaryKey: "financialLedgerLiveIntegrationCertification",
  },
  {
    name: "npm run smoke:financial-ledger-staging-dry-run-migration",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-staging-dry-run-migration"]),
    summaryKey: "financialLedgerStagingDryRunMigration",
  },
  {
    name: "npm run smoke:master-spec-mapping",
    command: npmCommand,
    args: npmArgs(["run", "smoke:master-spec-mapping"]),
    summaryKey: "masterSpecMapping",
  },
  {
    name: "npm run smoke:wheel",
    command: npmCommand,
    args: npmArgs(["run", "smoke:wheel"]),
    summaryKey: "wheel",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:project-closeout",
    command: npmCommand,
    args: npmArgs(["run", "smoke:project-closeout"]),
    summaryKey: "projectCloseout",
  },
  {
    name: "secret grep",
    command: "rg",
    args: [
      "-n",
      SECRET_GREP_PATTERN,
      "package.json",
      "README.md",
      "src/local-smoke-tests",
      "src/game-provider-mock",
      "docs",
      ".github",
    ],
    summaryKey: "secretGrep",
    expectNoMatches: true,
  },
  {
    name: "git diff --check",
    command: "git",
    args: ["diff", "--check", "--", ...RELATED_FILES],
    summaryKey: "diff",
  },
];

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function hasAnyToken(value, markers) {
  const tokens = tokenize(value);
  return markers.some((marker) => tokens.includes(marker));
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch (_error) {
    return null;
  }
}

function normalizeHost(hostname) {
  return String(hostname || "").toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
}

function isLoopbackHost(hostname) {
  const host = normalizeHost(hostname);
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function ensureApiPath(baseUrl) {
  const trimmed = String(baseUrl || "").trim().replace(/\/+$/, "");
  const parsed = parseUrl(trimmed);
  if (!parsed) return trimmed;
  if (parsed.pathname === "" || parsed.pathname === "/") return `${trimmed}/api`;
  return trimmed;
}

function configuredHealthBaseUrl() {
  if (process.env.BASE_URL) return ensureApiPath(process.env.BASE_URL);
  if (process.env.CORE_API_BASE_URL) return ensureApiPath(process.env.CORE_API_BASE_URL);
  if (process.env.PUBLIC_API_BASE_URL) return ensureApiPath(process.env.PUBLIC_API_BASE_URL);
  return DEFAULT_BASE_URL;
}

function inspectDatabaseTarget(databaseUrl) {
  const parsed = typeof databaseUrl === "string" && databaseUrl.trim() ? parseUrl(databaseUrl.trim()) : null;
  if (!parsed) {
    return { ok: false, localAllowed: false, reason: "DATABASE_URL must be set. Value is not printed." };
  }
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    return { ok: false, localAllowed: false, reason: "DATABASE_URL must use PostgreSQL. Value is not printed." };
  }

  const targetParts = [parsed.hostname, parsed.pathname, parsed.username];
  if (targetParts.some((part) => hasAnyToken(part, PRODUCTION_MARKERS))) {
    return {
      ok: false,
      localAllowed: false,
      reason: "DATABASE_URL appears production-like and is blocked. Value is not printed.",
    };
  }

  const localAllowed = isLoopbackHost(parsed.hostname);
  const hasSafeMarker = targetParts.some((part) => hasAnyToken(part, SAFE_TARGET_MARKERS));
  if (!localAllowed && !hasSafeMarker) {
    return {
      ok: false,
      localAllowed: false,
      reason: "DATABASE_URL must target local/staging/test PostgreSQL. Value is not printed.",
    };
  }

  return { ok: true, localAllowed, reason: null };
}

function inspectApiBaseUrl(label, apiBaseUrl) {
  const parsed = parseUrl(apiBaseUrl);
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, reason: `${label} must be a valid HTTP(S) URL.` };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, reason: `${label} must not contain embedded credentials.` };
  }
  if (hasAnyToken(parsed.hostname, PRODUCTION_MARKERS)) {
    return { ok: false, reason: `${label} appears production-like and is blocked.` };
  }
  if (!isLoopbackHost(parsed.hostname) && !hasAnyToken(parsed.hostname, SAFE_TARGET_MARKERS)) {
    return { ok: false, reason: `${label} must target local/staging/test only.` };
  }
  return { ok: true, reason: null };
}

function normalizedGuardEnv() {
  const env = { ...process.env };
  for (const key of PROVIDER_MODE_KEYS) {
    if (!env[key]) env[key] = "mock";
  }
  return env;
}

function assertLocalSafety() {
  const reasons = [];
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const databaseTarget = inspectDatabaseTarget(process.env.DATABASE_URL);
  const guardResult = evaluateDbSafetyGuard(normalizedGuardEnv());
  const urlEnvKeys = ["BASE_URL", "CORE_API_BASE_URL", "PUBLIC_API_BASE_URL"];

  if (!SAFE_NODE_ENVS.has(nodeEnv)) {
    reasons.push("NODE_ENV must be development-local or test.");
  }
  if (!process.env.LOCAL_ADMIN_PASSWORD) {
    reasons.push("LOCAL_ADMIN_PASSWORD must be set for local smoke tests.");
  }
  if (!process.env.JWT_SECRET) {
    reasons.push("JWT_SECRET must be set for local smoke tests.");
  }
  if (!databaseTarget.ok) {
    reasons.push(databaseTarget.reason);
  }

  for (const key of PROVIDER_MODE_KEYS) {
    const mode = String(process.env[key] || "mock").trim().toLowerCase();
    if (!SAFE_PROVIDER_MODES.has(mode)) {
      reasons.push(`${key} must be mock or sandbox for local smoke tests.`);
    }
  }

  for (const key of urlEnvKeys) {
    if (!process.env[key]) continue;
    const result = inspectApiBaseUrl(key, ensureApiPath(process.env[key]));
    if (!result.ok) reasons.push(result.reason);
  }

  for (const reason of guardResult.reasons) {
    const localMarkerReason = reason.startsWith("DATABASE_URL must include an explicit staging/test marker");
    if (localMarkerReason && databaseTarget.ok && databaseTarget.localAllowed) continue;
    reasons.push(reason);
  }

  if (reasons.length > 0) {
    throw new Error(`All local smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("All local smoke safety guard: PASS");
}

async function assertBackendHealth() {
  const baseUrl = configuredHealthBaseUrl();
  const healthUrl = `${baseUrl.replace(/\/+$/, "")}/health`;

  try {
    const response = await fetch(healthUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`health returned ${response.status}`);
    }
    const payload = await response.json();
    if (!payload || payload.success !== true) {
      throw new Error("health response was not successful");
    }
  } catch (error) {
    throw new Error(
      `Backend local health check failed. Please open node src/server.js before running smoke. Detail: ${error.message}`
    );
  }

  console.log("Backend local health check: PASS");
}

function sensitiveEnvValues() {
  const sensitiveKeyPattern = /password|token|secret|key|authorization|database/i;
  return Object.entries(process.env)
    .filter(([key, value]) => sensitiveKeyPattern.test(key) && typeof value === "string" && value.length >= 6)
    .map(([, value]) => value)
    .sort((a, b) => b.length - a.length);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeOutput(value) {
  let text = String(value || "");
  for (const secretValue of sensitiveEnvValues()) {
    text = text.replace(new RegExp(escapeRegExp(secretValue), "g"), "[REDACTED]");
  }

  text = text.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[REDACTED_DB_URL]");
  text = text.replace(/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g, "[REDACTED_JWT]");
  text = text.replace(new RegExp(`${["Be", "arer"].join("")}\\s+[^\\s"']+`, "gi"), "[REDACTED_AUTH]");
  text = text.replace(new RegExp(`${["e", "y", "J"].join("")}[A-Za-z0-9_-]+`, "g"), "[REDACTED_TOKEN]");
  text = text.replace(new RegExp(`${["s", "k", "-"].join("")}[A-Za-z0-9_-]+`, "g"), "[REDACTED_KEY]");
  return text;
}

function updateSummary(key, status) {
  const item = summary.find((entry) => entry.key === key);
  if (item) item.status = status;
}

function markSkippedAfterFailure() {
  for (const item of summary) {
    if (item.status === "PENDING") item.status = "SKIPPED";
  }
}

function printOutput(output, writer) {
  const sanitized = sanitizeOutput(output).trimEnd();
  if (sanitized) writer(sanitized);
}

function runStep(step) {
  console.log(`\n[RUN] ${step.name}`);
  const result = spawnSync(step.command, step.args, {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });

  printOutput(result.stdout, console.log);
  printOutput(result.stderr, console.error);

  if (result.error) {
    updateSummary(step.summaryKey, "FAIL");
    throw new Error(`${step.name} failed to start: ${result.error.message}`);
  }

  const exitCode = typeof result.status === "number" ? result.status : 1;
  const passed = step.expectNoMatches ? exitCode === 1 : exitCode === 0;
  if (!passed) {
    updateSummary(step.summaryKey, "FAIL");
    throw new Error(`${step.name} failed.`);
  }

  updateSummary(step.summaryKey, "PASS");
  for (const key of step.alsoPass || []) updateSummary(key, "PASS");
  console.log(`[PASS] ${step.name}`);
}

function printSummary(finalStatus) {
  console.log("\nSmoke all-local summary");
  for (const item of summary) {
    console.log(`- ${item.label}: ${item.status}`);
  }
  console.log(`- final result: ${finalStatus}`);
}

async function main() {
  let finalStatus = "FAIL";

  try {
    assertLocalSafety();
    await assertBackendHealth();

    for (const step of steps) {
      runStep(step);
    }

    finalStatus = "PASS";
  } catch (error) {
    console.error(sanitizeOutput(error.message));
    process.exitCode = 1;
  } finally {
    markSkippedAfterFailure();
    printSummary(finalStatus);
  }
}

main();

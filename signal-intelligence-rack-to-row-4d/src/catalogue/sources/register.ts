import type { Source } from "../types";
const source = (
  id: string,
  organization: string,
  url: string,
  scope: string,
): Source => ({
  id,
  organization,
  url,
  scope,
  checkedDate: "2026-10-15",
  status: "checked",
  license:
    "Reference only; vendor artwork not redistributed. Original procedural geometry.",
});
export const sourceRegister: Source[] = [
  source(
    "eia",
    "Schneider Electric",
    "https://shop.se.com/pro/us/en/product/apc-netshelter-sx-server-rack-gen-2-42u-1991h-x-600w-x-1070d-mm-with-sides-black-taa/",
    "Example EIA-310 enclosure; equipment count is demonstrative.",
  ),
  source(
    "ocp",
    "Open Compute Project",
    "https://www.opencompute.org/marketplace/facilities-physical-infrastructure/sanmina-open-rack-v3-orv3/",
    "Sanmina product: OU mounting, 48V DC, dimensions; ratings not generalized to all ORv3.",
  ),
  source(
    "b200",
    "NVIDIA",
    "https://www.nvidia.com/en-us/data-center/dgx-b200/",
    "Eight GPUs and two NVSwitch per DGX B200 system; rack population illustrative.",
  ),
  source(
    "gb300",
    "NVIDIA",
    "https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/components.html",
    "GB300 Enterprise RA counts, Grace/B300 trays, management and generation-specific power shelves.",
  ),
  source(
    "rubin",
    "NVIDIA",
    "https://docs.nvidia.com/dgx/dgxvr-user-guide/hardware.html",
    "Vera Rubin generation manual; not a GB300 mechanical BOM.",
  ),
  source(
    "helios",
    "AMD",
    "https://www.amd.com/en/products/rackscale-solutions/helios.html",
    "ORW double width, 72 MI455X, four scale-up cartridges, UALoE, Venice and Vulcano. Vendor projections not benchmarked.",
  ),
  source(
    "ironwood",
    "Google Cloud",
    "https://cloud.google.com/blog/products/compute/inside-the-ironwood-tpu-codesigned-ai-stack/",
    "Four chips/host, 64/rack cube, ICI torus, separate OCS.",
  ),
  source(
    "tpu7x",
    "Google Cloud",
    "https://docs.cloud.google.com/tpu/docs/tpu7x",
    "Two chiplets per chip, four-chip hosts and topology scopes.",
  ),
  source(
    "tpu8",
    "Google Cloud",
    "https://cloud.google.com/blog/topics/google-cloud-next/welcome-to-google-cloud-next26",
    "TPU 8t training and TPU 8i Boardfly inference; no inferred tray CAD.",
  ),
  source(
    "trn3",
    "AWS",
    "https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-ec2-trn3-ultraservers/",
    "Up to 144 Trainium3 chips per logical UltraServer, NeuronSwitch-v1; physical cabinet count unspecified.",
  ),
  source(
    "maia",
    "Microsoft",
    "https://blogs.microsoft.com/blog/2026/01/26/maia-200-the-ai-accelerator-built-for-inference/",
    "Maia 200 inference ASIC and closed-loop Heat Exchanger Unit.",
  ),
  source(
    "maia300",
    "Microsoft",
    "https://blogs.microsoft.com/blog/2026/10/12/microsoft-to-expand-azure-maia-system-to-multi-gigawatt-deployments/",
    "Maia 200 production, Maia 300 deployments planned 2027; roadmap not installed system.",
  ),
  source(
    "cs4",
    "Cerebras",
    "https://www.cerebras.ai/cs4",
    "Three WSE-3 Turbo backpacks/system, Nexus modular compute/power/I/O; advertised shipment quarter not independently confirmed.",
  ),
  source(
    "cray",
    "HPE",
    "https://www.hpe.com/us/en/collaterals/collateral.a00094635enw.html",
    "EX4000: eight chassis, up to 64 blades, no cabinet cooling fans; liquid CPU/GPU/switch cold plates and CDU.",
  ),
];
export const sourceById = Object.fromEntries(
  sourceRegister.map((s) => [s.id, s]),
);

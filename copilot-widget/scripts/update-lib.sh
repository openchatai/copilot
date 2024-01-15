echo "Updating lib..."
pnpm install
echo "Releasing lib..."
pnpm release
echo "Updating dashboard..."
cd ../dashboard/
pnpm add @openchatai/copilot-widget@latest
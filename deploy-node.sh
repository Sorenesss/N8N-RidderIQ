set -e

echo "Installing node_modules..."

pnpm install

PACKAGE_NAME=$(node -p "require('./package.json').name")

if [ -z "$PACKAGE_NAME" ]; then
  echo "Error: Could not determine package name from package.json."
  exit 1
fi

TARGET_DIR="var/lib/docker/volumes/n8n-n8n-data/_data/custom/$PACKAGE_NAME"

echo "Detected package name: '$PACKAGE_NAME'"
echo "Target deployment directory: '$TARGET_DIR'"

echo "Building node..."
pnpm run build

SOURCE_DIR="./dist"

echo "Deploying build output from '$SOURCE_DIR' to '$TARGET_DIR'..."

sudo rm -rf "$TARGET_DIR"
sudo mkdir -p "$TARGET_DIR"

sudo cp -r "$SOURCE_DIR/"* "$TARGET_DIR/"

echo "Deployment complete."

echo "Restarting n8n..."
docker container restart n8n-n8n-1

docker logs -f n8n-n8n-1
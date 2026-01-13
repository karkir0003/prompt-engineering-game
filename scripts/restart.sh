#! /bin/zsh

# Use when you want to restart your supabase containers to make changes
supabase stop
colima delete
colima start
sudo ln -sf "$HOME/.colima/default/docker.sock" /var/run/docker.sock
export DOCKER_HOST="unix:///var/run/docker.sock"

supabase start
yarn dev
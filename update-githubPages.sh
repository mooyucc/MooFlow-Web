#!/bin/bash

# MooFlow-Web GitHub Pages 更新脚本
# 用于方便地更新 dist 目录下的文件到 MooFlowPages.git 仓库

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查是否在正确的目录
check_directory() {
    if [ ! -d "dist" ]; then
        print_error "当前目录不是 MooFlow-Web 项目根目录！"
        print_error "请确保在包含 dist 目录的项目根目录中运行此脚本。"
        exit 1
    fi
}

# 检查 dist 目录是否为 Git 仓库
check_dist_git() {
    if [ ! -d "dist/.git" ]; then
        print_error "dist 目录不是 Git 仓库！"
        print_error "请先初始化 dist 目录的 Git 仓库。"
        exit 1
    fi
}

# 检查 dist 目录的远程仓库配置
check_dist_remote() {
    local current_remote=$(cd dist && git remote get-url origin 2>/dev/null)
    
    if [ -z "$current_remote" ]; then
        print_warning "dist 目录未配置远程仓库 origin"
        return 1
    fi
    
    print_message "dist 目录远程仓库: $current_remote"
    
    # 检查是否是 MooFlowPages 仓库
    if [[ "$current_remote" == *"mooyucc/MooFlowPages"* ]]; then
        print_message "远程仓库地址正确 (MooFlowPages)"
        return 0
    else
        print_warning "远程仓库地址可能不正确，预期地址应为:"
        print_warning "  - https://github.com/mooyucc/MooFlowPages.git"
        return 1
    fi
}

# 配置 dist 目录的远程仓库
setup_dist_remote() {
    print_step "配置 dist 目录的远程仓库..."
    
    # 进入 dist 目录
    cd dist
    
    # 移除现有的 origin
    git remote remove origin 2>/dev/null
    
    # 添加 MooFlowPages 仓库
    git remote add origin https://github.com/mooyucc/MooFlowPages.git
    print_message "已配置部署页面仓库: https://github.com/mooyucc/MooFlowPages.git"
    
    # 返回上级目录
    cd ..
}

# 重新构建项目
rebuild_project() {
    print_step "重新构建项目..."
    
    if npm run build; then
        print_message "项目构建成功"
        return 0
    else
        print_error "项目构建失败！"
        return 1
    fi
}

# 检查 dist 目录是否有更改
check_dist_changes() {
    cd dist
    
    if [ -z "$(git status --porcelain)" ]; then
        print_warning "dist 目录没有检测到任何更改，无需提交。"
        cd ..
        return 1
    fi
    
    cd ..
    return 0
}

# 显示 dist 目录状态
show_dist_status() {
    print_step "检查 dist 目录 Git 状态..."
    cd dist
    git status --short
    cd ..
    echo
}

# 添加 dist 目录的所有文件到暂存区
add_dist_files() {
    print_step "添加 dist 目录所有更改到暂存区..."
    cd dist
    git add .
    print_message "dist 目录文件已添加到暂存区"
    cd ..
}

# 提交 dist 目录的更改
commit_dist_changes() {
    local commit_message="$1"
    
    if [ -z "$commit_message" ]; then
        # 生成默认提交信息
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        commit_message="更新部署文件: $timestamp"
    fi
    
    print_step "提交 dist 目录更改..."
    cd dist
    git commit -m "$commit_message"
    print_message "dist 目录更改已提交: $commit_message"
    cd ..
}

# 推送 dist 目录到远程仓库
push_dist_to_remote() {
    print_step "推送 dist 目录到远程仓库..."
    
    cd dist
    
    # 获取当前分支名
    local current_branch=$(git branch --show-current)
    
    # 尝试推送到远程仓库
    if git push origin "$current_branch"; then
        print_message "成功推送到 MooFlowPages 仓库 (分支: $current_branch)"
    else
        print_error "推送失败！请检查网络连接和远程仓库配置。"
        cd ..
        exit 1
    fi
    
    cd ..
}

# 显示帮助信息
show_help() {
    echo "MooFlow-Web GitHub Pages 更新脚本"
    echo
    echo "用法:"
    echo "  $0 [选项] [提交信息]"
    echo
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -s, --status   只显示 dist 目录状态，不执行任何操作"
    echo "  -b, --build    重新构建项目"
    echo "  -a, --add      只添加 dist 目录文件到暂存区"
    echo "  -c, --commit   只提交 dist 目录更改（需要提供提交信息）"
    echo "  -p, --push     只推送 dist 目录到远程仓库"
    echo "  -r, --remote   检查 dist 目录远程仓库配置"
    echo "  --setup-remote 配置 dist 目录远程仓库"
    echo "  --full         完整流程：构建 + 提交 + 推送"
    echo
    echo "示例:"
    echo "  $0                           # 完整流程，使用默认提交信息"
    echo "  $0 '更新登录页面样式'          # 完整流程，使用自定义提交信息"
    echo "  $0 -s                        # 只显示状态"
    echo "  $0 -b                        # 只重新构建项目"
    echo "  $0 -c '修复页面布局问题'       # 只提交更改"
    echo "  $0 -r                        # 检查远程仓库配置"
    echo "  $0 --setup-remote            # 配置远程仓库"
    echo "  $0 --full                    # 完整流程"
    echo
    echo "目标仓库:"
    echo "  - 部署页面仓库: https://github.com/mooyucc/MooFlowPages.git"
    echo
}

# 主函数
main() {
    local commit_message=""
    local action="full"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -s|--status)
                action="status"
                shift
                ;;
            -b|--build)
                action="build"
                shift
                ;;
            -a|--add)
                action="add"
                shift
                ;;
            -c|--commit)
                action="commit"
                commit_message="$2"
                shift 2
                ;;
            -p|--push)
                action="push"
                shift
                ;;
            -r|--remote)
                action="remote"
                shift
                ;;
            --setup-remote)
                action="setup"
                shift
                ;;
            --full)
                action="full"
                shift
                ;;
            -*)
                print_error "未知选项: $1"
                show_help
                exit 1
                ;;
            *)
                commit_message="$1"
                shift
                ;;
        esac
    done
    
    # 检查目录
    check_directory
    
    case $action in
        "status")
            check_dist_git
            show_dist_status
            ;;
        "build")
            rebuild_project
            ;;
        "add")
            check_dist_git
            if check_dist_changes; then
                add_dist_files
                show_dist_status
            fi
            ;;
        "commit")
            check_dist_git
            if check_dist_changes; then
                add_dist_files
                commit_dist_changes "$commit_message"
            fi
            ;;
        "push")
            check_dist_git
            push_dist_to_remote
            ;;
        "remote")
            check_dist_git
            check_dist_remote
            ;;
        "setup")
            check_dist_git
            setup_dist_remote
            ;;
        "full")
            check_dist_git
            if rebuild_project; then
                if check_dist_changes; then
                    add_dist_files
                    commit_dist_changes "$commit_message"
                    push_dist_to_remote
                    print_message "GitHub Pages 更新完成！"
                else
                    print_warning "没有更改需要提交。"
                fi
            fi
            ;;
    esac
}

# 检查脚本是否被直接执行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 
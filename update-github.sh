#!/bin/bash

# MooFlow-Web GitHub 更新脚本
# 用于方便地上传文件到 GitHub 仓库

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

# 检查是否在 Git 仓库中
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_error "当前目录不是 Git 仓库！"
        exit 1
    fi
}

# 检查远程仓库配置
check_remote_config() {
    local current_remote=$(git remote get-url origin 2>/dev/null)
    
    if [ -z "$current_remote" ]; then
        print_warning "未配置远程仓库 origin"
        return 1
    fi
    
    print_message "当前远程仓库: $current_remote"
    
    # 检查是否是预期的仓库地址
    if [[ "$current_remote" == *"mooyucc/MooFlow"* ]] || [[ "$current_remote" == *"mooyucc/MooFlowPages"* ]]; then
        print_message "远程仓库地址正确"
        return 0
    else
        print_warning "远程仓库地址可能不正确，预期地址应为:"
        print_warning "  - https://github.com/mooyucc/MooFlow-Web.git (源代码仓库)"
        print_warning "  - https://github.com/mooyucc/MooFlowPages.git (部署页面仓库)"
        return 1
    fi
}

# 配置远程仓库
setup_remote() {
    local repo_type="$1"
    
    print_step "配置远程仓库..."
    
    # 移除现有的 origin
    git remote remove origin 2>/dev/null
    
    case $repo_type in
        "source"|"main")
            git remote add origin https://github.com/mooyucc/MooFlow-Web.git
            print_message "已配置源代码仓库: https://github.com/mooyucc/MooFlow-Web.git"
            ;;
        "pages"|"deploy")
            git remote add origin https://github.com/mooyucc/MooFlowPages.git
            print_message "已配置部署页面仓库: https://github.com/mooyucc/MooFlowPages.git"
            ;;
        *)
            print_error "未知的仓库类型: $repo_type"
            print_error "支持的类型: source/main, pages/deploy"
            exit 1
            ;;
    esac
}

# 检查是否有未提交的更改
check_changes() {
    if [ -z "$(git status --porcelain)" ]; then
        print_warning "没有检测到任何更改，无需提交。"
        return 1
    fi
    return 0
}

# 显示当前状态
show_status() {
    print_step "检查当前 Git 状态..."
    git status --short
    echo
}

# 添加所有文件到暂存区
add_files() {
    print_step "添加所有更改到暂存区..."
    git add .
    print_message "文件已添加到暂存区"
}

# 提交更改
commit_changes() {
    local commit_message="$1"
    
    if [ -z "$commit_message" ]; then
        # 生成默认提交信息
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        commit_message="Update: $timestamp"
    fi
    
    print_step "提交更改..."
    git commit -m "$commit_message"
    print_message "更改已提交: $commit_message"
}

# 推送到远程仓库
push_to_remote() {
    print_step "推送到远程仓库..."
    
    # 获取当前分支名
    local current_branch=$(git branch --show-current)
    
    # 尝试推送到远程仓库
    if git push origin "$current_branch"; then
        print_message "成功推送到远程仓库 (分支: $current_branch)"
    else
        print_error "推送失败！请检查网络连接和远程仓库配置。"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "MooFlow-Web GitHub 更新脚本"
    echo
    echo "用法:"
    echo "  $0 [选项] [提交信息]"
    echo
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -s, --status   只显示当前状态，不执行任何操作"
    echo "  -a, --add      只添加文件到暂存区"
    echo "  -c, --commit   只提交更改（需要提供提交信息）"
    echo "  -p, --push     只推送到远程仓库"
    echo "  -r, --remote   检查远程仓库配置"
    echo "  --setup-source 配置源代码仓库 (MooFlow)"
    echo "  --setup-pages  配置部署页面仓库 (MooFlowPages)"
    echo
    echo "示例:"
    echo "  $0                           # 完整流程，使用默认提交信息"
    echo "  $0 '修复登录页面样式问题'      # 完整流程，使用自定义提交信息"
    echo "  $0 -s                        # 只显示状态"
    echo "  $0 -c '添加新功能'            # 只提交更改"
    echo "  $0 -r                        # 检查远程仓库配置"
    echo "  $0 --setup-source            # 配置源代码仓库"
    echo "  $0 --setup-pages             # 配置部署页面仓库"
    echo
    echo "支持的仓库地址:"
    echo "  - 源代码仓库: https://github.com/mooyucc/MooFlow-Web.git"
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
            --setup-source)
                action="setup"
                setup_type="source"
                shift
                ;;
            --setup-pages)
                action="setup"
                setup_type="pages"
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
    
    # 检查是否在 Git 仓库中
    check_git_repo
    
    case $action in
        "status")
            show_status
            ;;
        "add")
            if check_changes; then
                add_files
                show_status
            fi
            ;;
        "commit")
            if check_changes; then
                add_files
                commit_changes "$commit_message"
            fi
            ;;
        "push")
            push_to_remote
            ;;
        "remote")
            check_remote_config
            ;;
        "setup")
            setup_remote "$setup_type"
            ;;
        "full")
            if check_changes; then
                add_files
                commit_changes "$commit_message"
                push_to_remote
                print_message "GitHub 更新完成！"
            else
                print_warning "没有更改需要提交。"
            fi
            ;;
    esac
}

# 检查脚本是否被直接执行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

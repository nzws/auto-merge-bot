# auto-merge-bot をインストールしました！
⚠️ **実際にリポジトリで使用するにはconfigファイルを作成する必要があります。**

auto-merge-bot を使用したいリポジトリで `.github/auto-merge-bot.config.yml` に、次の項目を記入してデフォルトブランチに入れてください。
```yaml
labels:
  - auto_merge_force
  - [auto_merge, minor]

# マージするPRにつけるラベルの条件
# 上記の例では、 auto_merge_force OR ( auto_merge AND minor ) の条件に一致したらマージを行います。

merge_type: squash # マージモード (optional): merge, squash, rebase デフォルト: merge
delete_branch: delete # マージ後にブランチを削除するかどうか (optional): delete または 空欄
```
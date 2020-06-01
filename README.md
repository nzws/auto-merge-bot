# auto-merge-bot

> ラベルが貼られた PR を自動レビュー&マージする Bot です。

# 使用例

master ブランチを保護してるけど Dependabot 等は自動マージしたい...！という時とかに使用できます。

# 使い方

#### Bot をインストール

https://github.com/apps/auto-merge-bot から、Bot をインストールしてください。後述の config ファイルが存在しないと動作しないため、ユーザ全体にインストールしてしまっても構いません。

#### リポジトリに config を追加

`.github/auto-merge-bot.config.yml` に、次の項目を記入してデフォルトブランチに入れてください。

```yaml
labels:
  - auto_merge_force
  - [auto_merge, minor]

# マージするPRにつけるラベルの条件
# 上記の例では、 auto_merge_force OR ( auto_merge AND minor ) の条件に一致したらマージを行います。

merge_type: squash # マージモード (optional): merge, squash, rebase デフォルト: merge
delete_branch: delete # マージ後にブランチを削除するかどうか (optional): delete または 空欄
```

## License

[Apache-2.0](LICENSE) © 2020 nzws <github@nzws.me> (https://github.com/nzws/auto-merge-bot)

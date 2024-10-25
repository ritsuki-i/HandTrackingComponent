import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ code }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        alert('コードがクリップボードにコピーされました');
    };

    return (
        <div style={{ position: 'relative', marginBottom: '20px' }}>
            <SyntaxHighlighter language="javascript" style={okaidia}>
                {code}
            </SyntaxHighlighter>
            <button
                onClick={copyToClipboard}
                style={{ position: 'absolute', top: '10px', right: '10px' }}
            >
                コピー
            </button>
        </div>
    );
};

const AirCursorDocumentation = () => (
    <div style={{ padding: '20px', color: '#000000' }}>
        <h2>インストール</h2>
        <p>以下のコマンドを実行して、AirCursorをインストールします。</p>
        <CodeBlock code={`npm install air-cursor`} language="bash" />
        <p>
            インストールが完了したら、<code>package.json</code>に
            <code>air-cursor</code>が含まれていることを確認してください。
        </p>

        <h2>アップグレード</h2>
        <p>AirCursorの新しいバージョンがリリースされた場合、以下のコマンドを使用してアップグレードできます。</p>
        <CodeBlock code={`npm update air-cursor`} language="bash" />
        <p>
        または、特定のバージョンにアップグレードしたい場合は、次のようにバージョン番号を指定します：
        </p>
        <CodeBlock code={`npm install air-cursor@latest`} language="bash" />
        <p><code>`@latest`</code>を指定すると、最も新しいバージョンがインストールされます。</p>
        <p>package.jsonのバージョンが書き換わっていない場合、コマンドを実行した後、手動で変更してください。</p>

        <h2>使い方</h2>
        <ol>
            <li>
                <h3>AirCursorをインポート</h3>
                <p>以下のようにReactコンポーネント内にAirCursorをインポートします:</p>
                <CodeBlock code={`import AirCursor from 'air-cursor';`} />
            </li>
            <li>
                <h3>AirCursorコンポーネントを追加</h3>
                <p>
                    JSX内に
                    <code>{`<AirCursor />`}</code>
                    を追加して、AirCursorを使用可能にします:
                </p>
                <CodeBlock code={`<AirCursor />`} language="jsx" />
            </li>
            <li>
                <h3>buttonTextプロパティの設定（オプション）</h3>
                <p>
                    <code>{`<AirCursor />`}</code>
                    コンポーネントには、初期設定ボタンのテキストをカスタマイズするための
                    <code>buttonText</code>
                    プロパティを設定できます（デフォルトは「ハンドトラッキングシステムを使用する」になっています）。
                    例えば、ボタンのテキストを"開始"に変更する場合は以下のようにします:
                </p>
                <CodeBlock code={`<AirCursor buttonText="開始" />`} language="jsx" />
            </li>
            <li>
                <h3>初期設定</h3>
                <p>
                    初めて
                    <code>{`<AirCursor />`}</code>
                    を表示すると、ボタンのみが出力されます。このボタンをクリックすると、ポップアップが表示され、
                    使い方を確認するチェックボックスをオンにする必要があります。
                </p>
            </li>
            <li>
                <h3>カメラビューの選択</h3>
                <p>
                    使用するウェブカメラの映像を画面に表示するか、または映像の配置場所を選択します。
                </p>
            </li>
            <li>
                <h3>カメラ使用の許可</h3>
                <p>
                    次に、ウェブブラウザからカメラの使用許可を求める通知が表示されます。
                    許可を与えると、AirCursorの使用を開始できます。
                </p>
            </li>
        </ol>
    </div>
);

export default AirCursorDocumentation;

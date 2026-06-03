import sys
from pathlib import Path


BLOCKED_NAMES = {".env", ".env.local", ".git"}


def is_allowed(path: Path) -> bool:
    return not any(part in BLOCKED_NAMES for part in path.parts)


def search_files(root: str, query: str, limit: int = 10) -> list[dict]:
    root_path = Path(root).resolve()
    if not root_path.exists():
        raise ValueError(f"Root does not exist: {root_path}")
    if not root_path.is_dir():
        raise ValueError(f"Root is not a directory: {root_path}")

    results = []
    for file_path in root_path.rglob("*"):
        if len(results) >= limit:
            break
        if not file_path.is_file() or not is_allowed(file_path):
            continue
        if file_path.suffix not in {".md", ".txt", ".py", ".js", ".ts"}:
            continue

        try:
            lines = file_path.read_text(encoding="utf-8").splitlines()
        except UnicodeDecodeError:
            continue

        for index, line in enumerate(lines, start=1):
            if query.lower() in line.lower():
                results.append(
                    {
                        "path": str(file_path),
                        "line": index,
                        "preview": line.strip()[:160],
                    }
                )
                break

    return results


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python search_files_demo.py <root> <query>")
        raise SystemExit(1)

    for item in search_files(sys.argv[1], sys.argv[2]):
        print(f"{item['path']}:{item['line']} {item['preview']}")

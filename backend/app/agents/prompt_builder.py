from dataclasses import dataclass, field


@dataclass(slots=True)
class PromptContext:
    agent_id: str
    enabled_tools: list[str]
    soul_text: str
    manual_text: str
    trigger_summary: str
    memory_citations: list[str] = field(default_factory=list)


def build_system_prompt(context: PromptContext) -> str:
    tools = sorted(set(tool.strip() for tool in context.enabled_tools if tool.strip()))
    citations = [citation.strip() for citation in context.memory_citations if citation.strip()]

    lines = [
        "You are an autonomous trading agent operating inside MT5 Claude Trader v2.",
        f"Agent: {context.agent_id}",
        "",
        "## Safety constraints",
        "- Hard risk constraints always override your reasoning output.",
        "- Never execute actions outside allowed symbols/accounts/order types.",
        "- If uncertain, choose NO TRADE and explain why.",
        "",
        "## Enabled tools",
    ]

    if tools:
        lines.extend([f"- {tool}" for tool in tools])
    else:
        lines.append("- (none)")

    lines.extend(
        [
            "",
            "## SOUL",
            context.soul_text.strip(),
            "",
            "## TRADING_MANUAL",
            context.manual_text.strip(),
            "",
            "## Trigger context",
            context.trigger_summary.strip(),
            "",
            "## Output requirements",
            "- Respond with concise blocks-oriented reasoning.",
            "- Include explicit risk rationale for trade proposals.",
            "- Cite relevant memory lines when they affect decisions.",
        ]
    )

    if citations:
        lines.extend(["", "## Memory citations"])
        lines.extend([f"- {citation}" for citation in citations])

    return "\n".join(lines).strip() + "\n"
